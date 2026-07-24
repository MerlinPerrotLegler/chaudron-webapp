import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import { emit } from '@/lib/webhooks';
import { parseDateOnly } from '@/lib/dates';
import { addPrix } from './matierePrix';
import { getMatiere } from './matiere';

export async function createEmplacement(input: { nom: string; notes?: string }) {
  const existing = await prisma.emplacement.findUnique({ where: { nom: input.nom } });
  if (existing) {
    throw new AppError('conflict', `Emplacement « ${input.nom} » existe déjà`, 409);
  }
  return prisma.emplacement.create({ data: input });
}

export async function listEmplacements() {
  return prisma.emplacement.findMany({
    where: { archive: false },
    orderBy: { nom: 'asc' },
  });
}

export async function getEmplacement(id: number) {
  const e = await prisma.emplacement.findUnique({ where: { id } });
  if (!e) throw new AppError('not_found', `Emplacement ${id} introuvable`, 404);
  return e;
}

export async function soldeMatiere(matiereId: number) {
  const agg = await prisma.lotStockMatiere.aggregate({
    where: { matiereId, quantiteRestante: { gt: 0 } },
    _sum: { quantiteRestante: true },
  });
  return agg._sum.quantiteRestante ?? 0;
}

export async function soldeProduit(produitFiniId: number) {
  const agg = await prisma.lotStockProduit.aggregate({
    where: { produitFiniId, quantiteRestante: { gt: 0 } },
    _sum: { quantiteRestante: true },
  });
  return agg._sum.quantiteRestante ?? 0;
}

export async function entrerMatiereDepuisRecolte(input: {
  matiereId: number;
  quantite: number;
  date: string;
  emplacementId?: number;
  datePeremption?: string;
  numerosSacs?: string[];
  recolteId: number;
  operateurNom?: string;
}) {
  const matiere = await getMatiere(input.matiereId);
  const lot = await prisma.$transaction(async (tx) => {
    const l = await tx.lotStockMatiere.create({
      data: {
        matiereId: input.matiereId,
        emplacementId: input.emplacementId,
        quantiteInitiale: input.quantite,
        quantiteRestante: input.quantite,
        unite: matiere.uniteAchat,
        dateEntree: parseDateOnly(input.date),
        datePeremption: input.datePeremption
          ? parseDateOnly(input.datePeremption)
          : undefined,
        numerosSacs: input.numerosSacs,
        sourceType: 'recolte',
        sourceId: input.recolteId,
        recolteId: input.recolteId,
      },
    });
    await tx.mouvement.create({
      data: {
        date: parseDateOnly(input.date),
        sens: 'entree',
        cible: 'matiere',
        lotMatiereId: l.id,
        quantite: input.quantite,
        emplacementId: input.emplacementId,
        operateurNom: input.operateurNom,
        refType: 'recolte',
        refId: input.recolteId,
      },
    });
    return l;
  });
  await emit('stock.mouvement', {
    sens: 'entree',
    cible: 'matiere',
    lot_id: lot.id,
    quantite: input.quantite,
    ref: 'recolte',
  });
  return lot;
}

export async function entrerMatiereDepuisTransformation(input: {
  matiereId: number;
  quantite: number;
  date: string;
  emplacementId?: number;
  datePeremption?: string;
  transformationId: number;
  operateurNom?: string;
}) {
  const matiere = await getMatiere(input.matiereId);
  const lot = await prisma.$transaction(async (tx) => {
    const l = await tx.lotStockMatiere.create({
      data: {
        matiereId: input.matiereId,
        emplacementId: input.emplacementId,
        quantiteInitiale: input.quantite,
        quantiteRestante: input.quantite,
        unite: matiere.uniteAchat,
        dateEntree: parseDateOnly(input.date),
        datePeremption: input.datePeremption
          ? parseDateOnly(input.datePeremption)
          : undefined,
        sourceType: 'transformation',
        sourceId: input.transformationId,
      },
    });
    await tx.mouvement.create({
      data: {
        date: parseDateOnly(input.date),
        sens: 'entree',
        cible: 'matiere',
        lotMatiereId: l.id,
        quantite: input.quantite,
        emplacementId: input.emplacementId,
        operateurNom: input.operateurNom,
        refType: 'transformation',
        refId: input.transformationId,
      },
    });
    return l;
  });
  await emit('stock.mouvement', {
    sens: 'entree',
    cible: 'matiere',
    lot_id: lot.id,
    quantite: input.quantite,
    ref: 'transformation',
  });
  return lot;
}

export async function declareAchat(input: {
  matiereId: number;
  date: string;
  quantite: number;
  prixUnitaire: number;
  fournisseur?: string;
  emplacementId?: number;
  datePeremption?: string;
  ajouterPrixCatalogue?: boolean;
  operateurNom?: string;
}) {
  const matiere = await getMatiere(input.matiereId);
  if (matiere.archivee) throw new AppError('conflict', 'Matière archivée', 409);

  const result = await prisma.$transaction(async (tx) => {
    const achat = await tx.achat.create({
      data: {
        matiereId: input.matiereId,
        date: parseDateOnly(input.date),
        quantite: input.quantite,
        prixUnitaire: input.prixUnitaire,
        fournisseur: input.fournisseur,
        emplacementId: input.emplacementId,
        datePeremption: input.datePeremption
          ? parseDateOnly(input.datePeremption)
          : undefined,
        ajouterPrixCatalogue: input.ajouterPrixCatalogue ?? true,
        operateurNom: input.operateurNom,
      },
    });
    const lot = await tx.lotStockMatiere.create({
      data: {
        matiereId: input.matiereId,
        emplacementId: input.emplacementId,
        quantiteInitiale: input.quantite,
        quantiteRestante: input.quantite,
        unite: matiere.uniteAchat,
        dateEntree: parseDateOnly(input.date),
        datePeremption: input.datePeremption
          ? parseDateOnly(input.datePeremption)
          : undefined,
        coutUnitaire: input.prixUnitaire,
        sourceType: 'achat',
        sourceId: achat.id,
        achatId: achat.id,
      },
    });
    await tx.mouvement.create({
      data: {
        date: parseDateOnly(input.date),
        sens: 'entree',
        cible: 'matiere',
        lotMatiereId: lot.id,
        quantite: input.quantite,
        emplacementId: input.emplacementId,
        operateurNom: input.operateurNom,
        refType: 'achat',
        refId: achat.id,
      },
    });
    return { achat, lot };
  });

  if (input.ajouterPrixCatalogue !== false) {
    await addPrix(input.matiereId, {
      date: input.date,
      prix: input.prixUnitaire,
    });
  }

  await emit('achat.declare', {
    id: result.achat.id,
    matiere_id: input.matiereId,
    quantite: input.quantite,
    prix_unitaire: input.prixUnitaire,
  });
  return result;
}

/** Sortie FIFO DLUO. */
export async function sortirMatiere(input: {
  matiereId: number;
  quantite: number;
  date: string;
  lotIds?: number[];
  refType?: string;
  refId?: number;
  operateurNom?: string;
}) {
  const disponible = await soldeMatiere(input.matiereId);
  if (disponible < input.quantite) {
    throw new AppError('STOCK_INSUFFISANT', 'Stock matière insuffisant', 409, {
      matiereId: input.matiereId,
      demande: input.quantite,
      disponible,
    });
  }

  const lots = await prisma.lotStockMatiere.findMany({
    where: {
      matiereId: input.matiereId,
      quantiteRestante: { gt: 0 },
      ...(input.lotIds ? { id: { in: input.lotIds } } : {}),
    },
    orderBy: [{ datePeremption: 'asc' }, { dateEntree: 'asc' }],
  });

  // NULLS LAST for datePeremption: Prisma MySQL puts nulls first on ASC — reorder
  lots.sort((a, b) => {
    if (a.datePeremption && b.datePeremption) {
      const d = a.datePeremption.getTime() - b.datePeremption.getTime();
      if (d !== 0) return d;
    } else if (a.datePeremption && !b.datePeremption) return -1;
    else if (!a.datePeremption && b.datePeremption) return 1;
    return a.dateEntree.getTime() - b.dateEntree.getTime();
  });

  let reste = input.quantite;
  const mouvements: { lotId: number; quantite: number }[] = [];

  await prisma.$transaction(async (tx) => {
    for (const lot of lots) {
      if (reste <= 0) break;
      const take = Math.min(lot.quantiteRestante, reste);
      await tx.lotStockMatiere.update({
        where: { id: lot.id },
        data: { quantiteRestante: lot.quantiteRestante - take },
      });
      await tx.mouvement.create({
        data: {
          date: parseDateOnly(input.date),
          sens: 'sortie',
          cible: 'matiere',
          lotMatiereId: lot.id,
          quantite: take,
          operateurNom: input.operateurNom,
          refType: input.refType,
          refId: input.refId,
        },
      });
      mouvements.push({ lotId: lot.id, quantite: take });
      reste -= take;
    }
    if (reste > 0) {
      throw new AppError('STOCK_INSUFFISANT', 'Stock matière insuffisant', 409, {
        matiereId: input.matiereId,
        demande: input.quantite,
        disponible,
      });
    }
  });

  await emit('stock.mouvement', {
    sens: 'sortie',
    cible: 'matiere',
    matiere_id: input.matiereId,
    quantite: input.quantite,
    lots: mouvements,
  });
  return { mouvements };
}

export async function entrerProduitDepuisProduction(input: {
  produitFiniId: number;
  quantiteUnites: number;
  date: string;
  datePeremption?: string;
  numeroLotProduction?: string;
  productionId?: number;
  emplacementId?: number;
  poidsKg?: number;
  notes?: string;
  operateurNom?: string;
}) {
  const produit = await prisma.produitFini.findUnique({
    where: { id: input.produitFiniId },
  });
  if (!produit || !produit.actif) {
    throw new AppError('not_found', `Produit ${input.produitFiniId} introuvable`, 404);
  }

  const lot = await prisma.$transaction(async (tx) => {
    const l = await tx.lotStockProduit.create({
      data: {
        produitFiniId: input.produitFiniId,
        emplacementId: input.emplacementId,
        quantiteInitiale: input.quantiteUnites,
        quantiteRestante: input.quantiteUnites,
        dateEntree: parseDateOnly(input.date),
        datePeremption: input.datePeremption
          ? parseDateOnly(input.datePeremption)
          : undefined,
        numeroLotProduction: input.numeroLotProduction,
        poidsKg: input.poidsKg,
        notes: input.notes,
        sourceType: 'production',
        sourceId: input.productionId,
        productionId: input.productionId,
      },
    });
    await tx.mouvement.create({
      data: {
        date: parseDateOnly(input.date),
        sens: 'entree',
        cible: 'produit',
        lotProduitId: l.id,
        quantite: input.quantiteUnites,
        emplacementId: input.emplacementId,
        operateurNom: input.operateurNom,
        refType: 'production',
        refId: input.productionId,
      },
    });
    return l;
  });

  await emit('stock.mouvement', {
    sens: 'entree',
    cible: 'produit',
    lot_id: lot.id,
    quantite: input.quantiteUnites,
  });
  return lot;
}

export async function sortirProduitPourVente(input: {
  produitFiniId: number;
  quantiteUnites: number;
  date: string;
  venteId?: number;
  lotIds?: number[];
  operateurNom?: string;
}) {
  const disponible = await soldeProduit(input.produitFiniId);
  if (disponible < input.quantiteUnites) {
    throw new AppError('STOCK_INSUFFISANT', 'Stock produit insuffisant', 409, {
      produitFiniId: input.produitFiniId,
      demande: input.quantiteUnites,
      disponible,
    });
  }

  const lots = await prisma.lotStockProduit.findMany({
    where: {
      produitFiniId: input.produitFiniId,
      quantiteRestante: { gt: 0 },
      ...(input.lotIds ? { id: { in: input.lotIds } } : {}),
    },
  });
  lots.sort((a, b) => {
    if (a.datePeremption && b.datePeremption) {
      const d = a.datePeremption.getTime() - b.datePeremption.getTime();
      if (d !== 0) return d;
    } else if (a.datePeremption && !b.datePeremption) return -1;
    else if (!a.datePeremption && b.datePeremption) return 1;
    return a.dateEntree.getTime() - b.dateEntree.getTime();
  });

  let reste = input.quantiteUnites;
  const mouvements: { lotId: number; quantite: number; mouvementId: number }[] = [];

  await prisma.$transaction(async (tx) => {
    for (const lot of lots) {
      if (reste <= 0) break;
      const fresh = await tx.lotStockProduit.findUniqueOrThrow({ where: { id: lot.id } });
      const take = Math.min(fresh.quantiteRestante, reste);
      if (take <= 0) continue;
      await tx.lotStockProduit.update({
        where: { id: lot.id },
        data: { quantiteRestante: fresh.quantiteRestante - take },
      });
      const mv = await tx.mouvement.create({
        data: {
          date: parseDateOnly(input.date),
          sens: 'sortie',
          cible: 'produit',
          lotProduitId: lot.id,
          quantite: take,
          operateurNom: input.operateurNom,
          refType: 'vente',
          refId: input.venteId,
        },
      });
      mouvements.push({ lotId: lot.id, quantite: take, mouvementId: mv.id });
      reste -= take;
    }
    if (reste > 0) {
      throw new AppError('STOCK_INSUFFISANT', 'Stock produit insuffisant', 409, {
        produitFiniId: input.produitFiniId,
        demande: input.quantiteUnites,
        disponible,
      });
    }
  });

  await emit('stock.mouvement', {
    sens: 'sortie',
    cible: 'produit',
    produit_fini_id: input.produitFiniId,
    quantite: input.quantiteUnites,
    lots: mouvements,
  });
  return { mouvements };
}

export async function restockerProduitDepuisVente(input: {
  produitFiniId: number;
  quantiteUnites: number;
  date: string;
  venteId?: number;
  operateurNom?: string;
  notes?: string;
}) {
  const lot = await prisma.$transaction(async (tx) => {
    const l = await tx.lotStockProduit.create({
      data: {
        produitFiniId: input.produitFiniId,
        quantiteInitiale: input.quantiteUnites,
        quantiteRestante: input.quantiteUnites,
        dateEntree: parseDateOnly(input.date),
        notes: input.notes ?? 'Retour annulation vente',
        sourceType: 'ajustement',
        sourceId: input.venteId,
      },
    });
    await tx.mouvement.create({
      data: {
        date: parseDateOnly(input.date),
        sens: 'entree',
        cible: 'produit',
        lotProduitId: l.id,
        quantite: input.quantiteUnites,
        operateurNom: input.operateurNom,
        refType: 'vente_annulee',
        refId: input.venteId,
        motif: 'annulation_vente',
      },
    });
    return l;
  });

  await emit('stock.mouvement', {
    sens: 'entree',
    cible: 'produit',
    lot_id: lot.id,
    quantite: input.quantiteUnites,
    motif: 'annulation_vente',
  });
  return lot;
}

export async function listAlertesStock() {
  const params = await prisma.parametres.upsert({
    where: { id: 1 },
    create: { id: 1 },
    update: {},
  });
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const limite = new Date(today);
  limite.setUTCDate(limite.getUTCDate() + params.seuilJoursAlerteDluo);

  const alertes: { code: string; message: string; details?: unknown }[] = [];

  const matieres = await prisma.matiere.findMany({
    where: { archivee: false, stockMini: { not: null } },
  });
  for (const m of matieres) {
    const solde = await soldeMatiere(m.id);
    if (m.stockMini != null && solde < m.stockMini) {
      alertes.push({
        code: 'matiere_sous_mini',
        message: `${m.nom} : solde ${solde} < mini ${m.stockMini}`,
        details: { matiereId: m.id, solde, stockMini: m.stockMini },
      });
    }
  }

  const lotsDluo = await prisma.lotStockMatiere.findMany({
    where: {
      quantiteRestante: { gt: 0 },
      datePeremption: { not: null, lte: limite },
    },
    include: { matiere: { select: { nom: true } } },
  });
  for (const l of lotsDluo) {
    const depassee = l.datePeremption! < today;
    alertes.push({
      code: depassee ? 'dluo_depassee' : 'dluo_proche',
      message: `${l.matiere.nom} lot #${l.id}`,
      details: {
        lotId: l.id,
        datePeremption: l.datePeremption,
        quantiteRestante: l.quantiteRestante,
      },
    });
  }

  return alertes;
}
