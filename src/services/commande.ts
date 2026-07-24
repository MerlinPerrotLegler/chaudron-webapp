import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import { emit } from '@/lib/webhooks';
import { parseDateOnly } from '@/lib/dates';
import { getClient } from './client';
import { getPointVente } from './pointVente';
import { sortirProduitPourVente } from './stock';

async function assertProduitActif(produitFiniId: number) {
  const p = await prisma.produitFini.findUnique({ where: { id: produitFiniId } });
  if (!p || !p.actif) {
    throw new AppError('conflict', `Produit ${produitFiniId} inactif ou introuvable`, 409);
  }
  return p;
}

export async function createCommande(input: {
  clientId: number;
  pointVenteId: number;
  dateCommande: string;
  dateLivraison: string;
  reference?: string;
  notes?: string;
  operateurNom?: string;
  lignes: {
    produitFiniId: number;
    quantite: number;
    prixUnitaire?: number;
    notes?: string;
  }[];
}) {
  await getClient(input.clientId);
  await getPointVente(input.pointVenteId);
  if (!input.lignes.length) {
    throw new AppError('validation', 'Au moins une ligne requise', 422);
  }

  const lignesData = [];
  for (const l of input.lignes) {
    const p = await assertProduitActif(l.produitFiniId);
    const prix = l.prixUnitaire ?? p.prixVenteUnite ?? 0;
    lignesData.push({
      produitFiniId: l.produitFiniId,
      quantite: l.quantite,
      prixUnitaire: prix,
      montant: prix * l.quantite,
      notes: l.notes,
    });
  }

  const cmd = await prisma.commande.create({
    data: {
      clientId: input.clientId,
      pointVenteId: input.pointVenteId,
      dateCommande: parseDateOnly(input.dateCommande),
      dateLivraison: parseDateOnly(input.dateLivraison),
      reference: input.reference,
      notes: input.notes,
      operateurNom: input.operateurNom,
      lignes: { create: lignesData },
    },
    include: {
      lignes: true,
      client: true,
      pointVente: true,
    },
  });
  return cmd;
}

export async function listCommandes(params: {
  clientId?: number;
  pointVenteId?: number;
  statut?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
} = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 50;
  const where = {
    ...(params.clientId ? { clientId: params.clientId } : {}),
    ...(params.pointVenteId ? { pointVenteId: params.pointVenteId } : {}),
    ...(params.statut
      ? { statut: params.statut as 'brouillon' | 'confirmee' | 'preparee' | 'livree' | 'annulee' }
      : {}),
    ...(params.from || params.to
      ? {
          dateLivraison: {
            ...(params.from ? { gte: parseDateOnly(params.from) } : {}),
            ...(params.to ? { lte: parseDateOnly(params.to) } : {}),
          },
        }
      : {}),
  };
  const [items, total] = await Promise.all([
    prisma.commande.findMany({
      where,
      orderBy: { dateLivraison: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        lignes: true,
        client: { select: { id: true, nom: true } },
        pointVente: { select: { id: true, nom: true } },
      },
    }),
    prisma.commande.count({ where }),
  ]);
  return { items, total, page, pageSize };
}

export async function getCommande(id: number) {
  const c = await prisma.commande.findUnique({
    where: { id },
    include: {
      lignes: { include: { produitFini: { include: { recette: true } } } },
      client: true,
      pointVente: true,
      ventes: true,
    },
  });
  if (!c) throw new AppError('not_found', `Commande ${id} introuvable`, 404);
  return c;
}

export async function updateCommande(
  id: number,
  input: {
    dateLivraison?: string;
    reference?: string | null;
    notes?: string | null;
  },
) {
  const c = await getCommande(id);
  if (!['brouillon', 'confirmee', 'preparee'].includes(c.statut)) {
    throw new AppError('conflict', 'Commande non modifiable dans ce statut', 409);
  }
  return prisma.commande.update({
    where: { id },
    data: {
      ...(input.dateLivraison
        ? { dateLivraison: parseDateOnly(input.dateLivraison) }
        : {}),
      reference: input.reference,
      notes: input.notes,
    },
    include: { lignes: true },
  });
}

export async function confirmerCommande(id: number) {
  const c = await getCommande(id);
  if (c.statut !== 'brouillon') {
    throw new AppError('conflict', 'Seule une commande brouillon peut être confirmée', 409);
  }
  const updated = await prisma.commande.update({
    where: { id },
    data: { statut: 'confirmee' },
    include: { lignes: true },
  });
  await emit('commande.confirmee', {
    id: updated.id,
    client_id: updated.clientId,
    point_vente_id: updated.pointVenteId,
    date_livraison: updated.dateLivraison.toISOString().slice(0, 10),
    lignes: updated.lignes.map((l) => ({
      produit_fini_id: l.produitFiniId,
      quantite: l.quantite,
      prix_unitaire: l.prixUnitaire,
    })),
    notes: updated.notes,
  });
  return updated;
}

export async function preparerCommande(id: number) {
  const c = await getCommande(id);
  if (c.statut !== 'confirmee') {
    throw new AppError('conflict', 'Seule une commande confirmée peut être préparée', 409);
  }
  return prisma.commande.update({
    where: { id },
    data: { statut: 'preparee' },
    include: { lignes: true },
  });
}

export async function livrerCommande(
  id: number,
  input: { dateLivraisonReelle?: string; operateurNom?: string } = {},
) {
  const c = await getCommande(id);
  if (c.statut === 'livree') {
    throw new AppError('conflict', 'Commande déjà livrée', 409);
  }
  if (c.statut === 'annulee') {
    throw new AppError('conflict', 'Commande annulée', 409);
  }
  if (!['confirmee', 'preparee'].includes(c.statut)) {
    throw new AppError('conflict', 'Commande non livrable dans ce statut', 409);
  }

  const dateLivraison =
    input.dateLivraisonReelle ?? c.dateLivraison.toISOString().slice(0, 10);
  const venteIds: number[] = [];

  // Pré-check stock pour éviter déstockage partiel
  for (const l of c.lignes) {
    const agg = await prisma.lotStockProduit.aggregate({
      where: { produitFiniId: l.produitFiniId, quantiteRestante: { gt: 0 } },
      _sum: { quantiteRestante: true },
    });
    const dispo = agg._sum.quantiteRestante ?? 0;
    if (dispo < l.quantite) {
      throw new AppError('STOCK_INSUFFISANT', 'Stock produit insuffisant', 409, {
        produitFiniId: l.produitFiniId,
        demande: l.quantite,
        disponible: dispo,
        commandeLigneId: l.id,
      });
    }
  }

  for (const l of c.lignes) {
    const vente = await prisma.venteLigne.create({
      data: {
        date: parseDateOnly(dateLivraison),
        produitFiniId: l.produitFiniId,
        pointVenteId: c.pointVenteId,
        clientId: c.clientId,
        quantite: l.quantite,
        prixUnitaire: l.prixUnitaire,
        montant: l.montant,
        source: 'commande',
        commandeId: c.id,
        commandeLigneId: l.id,
        operateurNom: input.operateurNom ?? c.operateurNom ?? undefined,
      },
    });
    const out = await sortirProduitPourVente({
      produitFiniId: l.produitFiniId,
      quantiteUnites: l.quantite,
      date: dateLivraison,
      venteId: vente.id,
      operateurNom: input.operateurNom ?? c.operateurNom ?? undefined,
    });
    await prisma.venteLigne.update({
      where: { id: vente.id },
      data: {
        stockMouvementIds: out.mouvements.map((m) => m.mouvementId),
      },
    });
    venteIds.push(vente.id);
    await emit('vente.realisee', {
      id: vente.id,
      client_id: c.clientId,
      commande_id: c.id,
      source: 'commande',
      produit_fini_id: l.produitFiniId,
      quantite: l.quantite,
      montant: l.montant,
    });
  }

  const updated = await prisma.commande.update({
    where: { id },
    data: { statut: 'livree' },
    include: { lignes: true, ventes: true },
  });

  await emit('commande.livree', {
    id: updated.id,
    client_id: updated.clientId,
    point_vente_id: updated.pointVenteId,
    date_livraison: dateLivraison,
    vente_ids: venteIds,
  });
  return updated;
}

export async function annulerCommande(id: number) {
  const c = await getCommande(id);
  if (c.statut === 'livree') {
    throw new AppError('conflict', 'Impossible d’annuler une commande livrée', 409);
  }
  if (c.statut === 'annulee') {
    throw new AppError('conflict', 'Commande déjà annulée', 409);
  }
  const updated = await prisma.commande.update({
    where: { id },
    data: { statut: 'annulee' },
  });
  await emit('commande.annulee', { id: updated.id, client_id: updated.clientId });
  return updated;
}

export async function listLivraisons(params: { from: string; to: string }) {
  const from = parseDateOnly(params.from);
  const to = parseDateOnly(params.to);
  const [commandes, datesPdv] = await Promise.all([
    prisma.commande.findMany({
      where: {
        dateLivraison: { gte: from, lte: to },
        statut: { not: 'annulee' },
      },
      include: {
        client: { select: { id: true, nom: true } },
        pointVente: { select: { id: true, nom: true } },
        lignes: true,
      },
      orderBy: { dateLivraison: 'asc' },
    }),
    prisma.pointVenteDateLivraison.findMany({
      where: { date: { gte: from, lte: to } },
      include: { pointVente: { select: { id: true, nom: true } } },
    }),
  ]);
  return {
    commandes,
    datesPointVente: datesPdv,
  };
}
