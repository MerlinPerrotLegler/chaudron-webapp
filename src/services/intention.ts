import type { PrioriteLot } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import { parseDateOnly } from '@/lib/dates';
import { computeRevient } from './produitRevient';

export async function upsertIntention(input: {
  produitFiniId: number;
  annee: number;
  unitesVisees: number;
  priorite?: PrioriteLot;
  notes?: string;
}) {
  const produit = await prisma.produitFini.findUnique({
    where: { id: input.produitFiniId },
  });
  if (!produit || !produit.actif) {
    throw new AppError('not_found', `Produit ${input.produitFiniId} introuvable`, 404);
  }
  const row = await prisma.intentionVente.upsert({
    where: {
      produitFiniId_annee: {
        produitFiniId: input.produitFiniId,
        annee: input.annee,
      },
    },
    create: {
      produitFiniId: input.produitFiniId,
      annee: input.annee,
      unitesVisees: input.unitesVisees,
      priorite: input.priorite ?? 'P2',
      notes: input.notes,
    },
    update: {
      unitesVisees: input.unitesVisees,
      ...(input.priorite !== undefined ? { priorite: input.priorite } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
    },
  });
  return row;
}

export async function listIntentions(annee?: number) {
  return prisma.intentionVente.findMany({
    where: annee ? { annee } : undefined,
    include: {
      produitFini: {
        include: {
          recette: { select: { id: true, nom: true } },
          conditionnement: { select: { id: true, nom: true } },
        },
      },
    },
    orderBy: [{ annee: 'desc' }, { priorite: 'asc' }],
  });
}

export async function realiseVsIntention(annee: number) {
  const intentions = await listIntentions(annee);
  const from = parseDateOnly(`${annee}-01-01`);
  const to = parseDateOnly(`${annee}-12-31`);
  const ventes = await prisma.venteLigne.groupBy({
    by: ['produitFiniId'],
    where: {
      statut: 'validee',
      date: { gte: from, lte: to },
    },
    _sum: { quantite: true, montant: true },
  });
  const byProduit = new Map(
    ventes.map((v) => [v.produitFiniId, v._sum]),
  );

  const rows = [];
  for (const i of intentions) {
    const real = byProduit.get(i.produitFiniId);
    const unitesRealisees = real?.quantite ?? 0;
    let caPrevu: number | null = null;
    let margePrevue: number | null = null;
    if (i.produitFini.prixVenteUnite != null) {
      caPrevu = i.unitesVisees * i.produitFini.prixVenteUnite;
      try {
        const rev = await computeRevient(i.produitFiniId);
        if (rev.margeUnite != null) {
          margePrevue = i.unitesVisees * rev.margeUnite;
        }
      } catch {
        /* revient partiel OK */
      }
    }
    rows.push({
      produitFiniId: i.produitFiniId,
      annee: i.annee,
      unitesVisees: i.unitesVisees,
      unitesRealisees,
      caRealise: real?.montant ?? 0,
      caPrevu,
      margePrevue,
      priorite: i.priorite,
      produit: i.produitFini,
    });
  }
  return rows;
}
