import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import { emit } from '@/lib/webhooks';
import { parseDateOnly } from '@/lib/dates';
import { toUniteAchat } from '@/lib/units';
import { sortirMatiere, entrerProduitDepuisProduction } from './stock';

export async function createProduction(input: {
  recetteId: number;
  date: string;
  numeroLot: string;
  facteurEchelle?: number;
  quantiteSortieVisee?: number;
  sorties: {
    produitFiniId: number;
    quantiteUnites: number;
    poidsKg?: number;
    emplacementId?: number;
    datePeremption?: string;
  }[];
  operateurNom?: string;
  notes?: string;
  poidsKg?: string | number;
}) {
  const recette = await prisma.recette.findUnique({
    where: { id: input.recetteId },
    include: {
      ingredients: { include: { matiere: true } },
      etapes: { orderBy: { ordre: 'asc' } },
    },
  });
  if (!recette || recette.archivee) {
    throw new AppError('not_found', `Recette ${input.recetteId} introuvable`, 404);
  }
  if (!input.sorties.length) {
    throw new AppError('validation', 'Au moins une sortie produit requise', 422);
  }

  let facteur = input.facteurEchelle ?? 1;
  if (input.quantiteSortieVisee != null) {
    if (!recette.quantiteSortie || recette.quantiteSortie <= 0) {
      throw new AppError('validation', 'Recette sans quantiteSortie pour échelle', 422);
    }
    facteur = input.quantiteSortieVisee / recette.quantiteSortie;
  }

  const lignes = recette.ingredients.map((ing) => {
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
    return {
      matiereId: ing.matiereId,
      quantiteRequise: q,
    };
  });

  const existing = await prisma.production.findUnique({
    where: { numeroLot: input.numeroLot },
  });
  if (existing) {
    throw new AppError('conflict', `N° de lot « ${input.numeroLot} » déjà utilisé`, 409);
  }

  const p = await prisma.production.create({
    data: {
      recetteId: input.recetteId,
      date: parseDateOnly(input.date),
      numeroLot: input.numeroLot,
      facteurEchelle: facteur,
      quantiteSortieVisee: input.quantiteSortieVisee,
      poidsKg:
        typeof input.poidsKg === 'string' ? Number(input.poidsKg) : input.poidsKg,
      operateurNom: input.operateurNom,
      notes: input.notes,
      statut: 'en_cours',
      lignesMatiere: { create: lignes },
      sorties: {
        create: input.sorties.map((s) => ({
          produitFiniId: s.produitFiniId,
          quantiteUnites: s.quantiteUnites,
          poidsKg: s.poidsKg,
          emplacementId: s.emplacementId,
          datePeremption: s.datePeremption
            ? parseDateOnly(s.datePeremption)
            : undefined,
        })),
      },
      etapes: {
        create: recette.etapes.map((e) => ({
          etapeRecetteId: e.id,
          ordre: e.ordre,
          description: e.description,
          tempsMainOeuvrePrevuMin: e.tempsMainOeuvre,
          tempsAttentePrevuMin: e.tempsAttente,
        })),
      },
    },
    include: { lignesMatiere: true, sorties: true, etapes: true },
  });

  return p;
}

export async function terminerProduction(id: number) {
  const p = await prisma.production.findUnique({
    where: { id },
    include: { lignesMatiere: true, sorties: true },
  });
  if (!p) throw new AppError('not_found', `Production ${id} introuvable`, 404);
  if (p.statut === 'terminee') {
    throw new AppError('conflict', 'Production déjà terminée', 409);
  }
  if (p.statut === 'annulee') {
    throw new AppError('conflict', 'Production annulée', 409);
  }

  const date = p.date.toISOString().slice(0, 10);

  for (const ligne of p.lignesMatiere) {
    await sortirMatiere({
      matiereId: ligne.matiereId,
      quantite: ligne.quantiteRequise,
      date,
      refType: 'production',
      refId: p.id,
      operateurNom: p.operateurNom ?? undefined,
    });
  }

  for (const s of p.sorties) {
    const lot = await entrerProduitDepuisProduction({
      produitFiniId: s.produitFiniId,
      quantiteUnites: s.quantiteUnites,
      date,
      datePeremption: s.datePeremption
        ? s.datePeremption.toISOString().slice(0, 10)
        : undefined,
      numeroLotProduction: p.numeroLot,
      productionId: p.id,
      emplacementId: s.emplacementId ?? undefined,
      poidsKg: s.poidsKg ?? undefined,
      operateurNom: p.operateurNom ?? undefined,
    });
    await prisma.productionSortie.update({
      where: { id: s.id },
      data: { lotStockProduitId: lot.id },
    });
  }

  const updated = await prisma.production.update({
    where: { id },
    data: { statut: 'terminee' },
    include: { lignesMatiere: true, sorties: true, etapes: true },
  });

  await emit('production.declaree', {
    id: updated.id,
    recette_id: updated.recetteId,
    numero_lot: updated.numeroLot,
  });

  return updated;
}

export async function getProduction(id: number) {
  const p = await prisma.production.findUnique({
    where: { id },
    include: {
      recette: { select: { id: true, nom: true } },
      lignesMatiere: {
        include: { matiere: { select: { id: true, nom: true } } },
      },
      sorties: {
        include: {
          produitFini: {
            include: {
              recette: { select: { nom: true } },
              conditionnement: { select: { nom: true } },
            },
          },
        },
      },
      etapes: { orderBy: { ordre: 'asc' } },
    },
  });
  if (!p) throw new AppError('not_found', `Production ${id} introuvable`, 404);
  return p;
}

export async function listProductions(params: {
  page?: number;
  pageSize?: number;
  statut?: string;
}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 50;
  const where = {
    ...(params.statut
      ? { statut: params.statut as 'brouillon' | 'en_cours' | 'terminee' | 'annulee' }
      : {}),
  };
  const [items, total] = await Promise.all([
    prisma.production.findMany({
      where,
      orderBy: { date: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        recette: { select: { id: true, nom: true } },
        sorties: true,
      },
    }),
    prisma.production.count({ where }),
  ]);
  return { items, total, page, pageSize };
}
