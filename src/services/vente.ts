import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import { emit } from '@/lib/webhooks';
import { parseDateOnly } from '@/lib/dates';
import { getPointVente } from './pointVente';
import { getClient } from './client';
import { sortirProduitPourVente, restockerProduitDepuisVente } from './stock';
import { toUniteAchat } from '@/lib/units';

export async function declareVenteDirecte(input: {
  date: string;
  produitFiniId: number;
  pointVenteId: number;
  clientId?: number;
  quantite: number;
  prixUnitaire?: number;
  notes?: string;
  operateurNom?: string;
}) {
  await getPointVente(input.pointVenteId);
  if (input.clientId) await getClient(input.clientId);

  const produit = await prisma.produitFini.findUnique({
    where: { id: input.produitFiniId },
  });
  if (!produit || !produit.actif) {
    throw new AppError('conflict', `Produit ${input.produitFiniId} inactif ou introuvable`, 409);
  }
  const prix = input.prixUnitaire ?? produit.prixVenteUnite ?? 0;
  const montant = prix * input.quantite;

  const vente = await prisma.venteLigne.create({
    data: {
      date: parseDateOnly(input.date),
      produitFiniId: input.produitFiniId,
      pointVenteId: input.pointVenteId,
      clientId: input.clientId,
      quantite: input.quantite,
      prixUnitaire: prix,
      montant,
      source: 'directe',
      notes: input.notes,
      operateurNom: input.operateurNom,
    },
  });

  try {
    const out = await sortirProduitPourVente({
      produitFiniId: input.produitFiniId,
      quantiteUnites: input.quantite,
      date: input.date,
      venteId: vente.id,
      operateurNom: input.operateurNom,
    });
    const updated = await prisma.venteLigne.update({
      where: { id: vente.id },
      data: {
        stockMouvementIds: out.mouvements.map((m) => m.mouvementId),
      },
    });
    await emit('vente.realisee', {
      id: updated.id,
      client_id: updated.clientId,
      source: 'directe',
      produit_fini_id: updated.produitFiniId,
      quantite: updated.quantite,
      montant: updated.montant,
    });
    return updated;
  } catch (e) {
    await prisma.venteLigne.delete({ where: { id: vente.id } });
    throw e;
  }
}

export async function annulerVente(id: number) {
  const v = await prisma.venteLigne.findUnique({ where: { id } });
  if (!v) throw new AppError('not_found', `Vente ${id} introuvable`, 404);
  if (v.statut === 'annulee') {
    throw new AppError('conflict', 'Vente déjà annulée', 409);
  }

  await restockerProduitDepuisVente({
    produitFiniId: v.produitFiniId,
    quantiteUnites: v.quantite,
    date: new Date().toISOString().slice(0, 10),
    venteId: v.id,
    operateurNom: v.operateurNom ?? undefined,
  });

  const updated = await prisma.venteLigne.update({
    where: { id },
    data: { statut: 'annulee' },
  });
  await emit('vente.annulee', {
    id: updated.id,
    client_id: updated.clientId,
    commande_id: updated.commandeId,
    produit_fini_id: updated.produitFiniId,
    quantite: updated.quantite,
  });
  return updated;
}

export async function listVentes(params: {
  from?: string;
  to?: string;
  produitFiniId?: number;
  pointVenteId?: number;
  clientId?: number;
  page?: number;
  pageSize?: number;
} = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 50;
  const where = {
    ...(params.produitFiniId ? { produitFiniId: params.produitFiniId } : {}),
    ...(params.pointVenteId ? { pointVenteId: params.pointVenteId } : {}),
    ...(params.clientId ? { clientId: params.clientId } : {}),
    ...(params.from || params.to
      ? {
          date: {
            ...(params.from ? { gte: parseDateOnly(params.from) } : {}),
            ...(params.to ? { lte: parseDateOnly(params.to) } : {}),
          },
        }
      : {}),
  };
  const [items, total] = await Promise.all([
    prisma.venteLigne.findMany({
      where,
      orderBy: { date: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        produitFini: { include: { recette: { select: { nom: true } } } },
        pointVente: { select: { id: true, nom: true } },
        client: { select: { id: true, nom: true } },
      },
    }),
    prisma.venteLigne.count({ where }),
  ]);
  return { items, total, page, pageSize };
}

export async function listBesoins(params: {
  annee: number;
  inclureCommandes?: boolean;
}) {
  const intentions = await prisma.intentionVente.findMany({
    where: { annee: params.annee },
  });

  const besoinParProduit = new Map<number, number>();
  for (const i of intentions) {
    besoinParProduit.set(
      i.produitFiniId,
      (besoinParProduit.get(i.produitFiniId) ?? 0) + i.unitesVisees,
    );
  }

  if (params.inclureCommandes) {
    const cmds = await prisma.commande.findMany({
      where: {
        statut: { in: ['confirmee', 'preparee'] },
        dateLivraison: {
          gte: parseDateOnly(`${params.annee}-01-01`),
          lte: parseDateOnly(`${params.annee}-12-31`),
        },
      },
      include: { lignes: true },
    });
    for (const c of cmds) {
      for (const l of c.lignes) {
        besoinParProduit.set(
          l.produitFiniId,
          (besoinParProduit.get(l.produitFiniId) ?? 0) + l.quantite,
        );
      }
    }
  }

  const matiereQty = new Map<
    number,
    { matiereId: number; nom: string; unite: string; quantite: number }
  >();

  for (const [produitFiniId, unites] of besoinParProduit) {
    const produit = await prisma.produitFini.findUnique({
      where: { id: produitFiniId },
      include: {
        recette: {
          include: {
            ingredients: { include: { matiere: true } },
          },
        },
      },
    });
    if (!produit) continue;
    const recette = produit.recette;
    const facteur =
      recette.quantiteSortie && recette.quantiteSortie > 0 && produit.poidsUnite > 0
        ? (unites * produit.poidsUnite) / recette.quantiteSortie
        : unites;

    for (const ing of recette.ingredients) {
      let q = ing.quantite * facteur;
      if (recette.modeQuantite === 'absolu') {
        const conv = toUniteAchat(
          ing.quantite,
          ing.unite,
          ing.matiere.uniteAchat,
          ing.poidsEquivG,
        );
        q = (conv ?? ing.quantite) * facteur;
      }
      const prev = matiereQty.get(ing.matiereId);
      if (prev) {
        prev.quantite += q;
      } else {
        matiereQty.set(ing.matiereId, {
          matiereId: ing.matiereId,
          nom: ing.matiere.nom,
          unite: ing.matiere.uniteAchat,
          quantite: q,
        });
      }
    }
  }

  return [...matiereQty.values()].sort((a, b) => a.nom.localeCompare(b.nom));
}
