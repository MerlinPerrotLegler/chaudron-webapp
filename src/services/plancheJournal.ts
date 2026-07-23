import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import { emit } from '@/lib/webhooks';
import { getPlanche } from './planche';

const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const travailSolCreateSchema = z.object({
  date: dateStr,
  type: z.string().min(1),
  description: z.string().optional(),
  operateurNom: z.string().optional(),
});

export const entrantCreateSchema = z.object({
  date: dateStr,
  type: z.enum([
    'compost',
    'amendement',
    'fertilisation',
    'phyto',
    'irrigation',
    'semence_plant',
    'autre',
  ]),
  produit: z.string().min(1),
  quantite: z.number().optional(),
  unite: z.string().optional(),
  refGaine: z.string().optional(),
  refSemencePlant: z.string().optional(),
  operateurNom: z.string().optional(),
});

export const plancheJourSchema = z.object({
  notes: z.string(),
});

export const plancheImageCreateSchema = z.object({
  cheminFichier: z.string().min(1),
  legende: z.string().optional(),
  ordre: z.number().int().nonnegative().optional(),
});

export async function addTravailSol(
  plancheId: number,
  input: z.infer<typeof travailSolCreateSchema>,
) {
  await getPlanche(plancheId);
  return prisma.travailSol.create({
    data: {
      plancheId,
      date: new Date(input.date),
      type: input.type,
      description: input.description,
      operateurNom: input.operateurNom,
    },
  });
}

export async function listTravauxSol(plancheId: number) {
  await getPlanche(plancheId);
  return prisma.travailSol.findMany({
    where: { plancheId },
    orderBy: { date: 'desc' },
  });
}

export async function addEntrant(
  plancheId: number,
  input: z.infer<typeof entrantCreateSchema>,
) {
  await getPlanche(plancheId);
  const e = await prisma.entrant.create({
    data: {
      plancheId,
      date: new Date(input.date),
      type: input.type,
      produit: input.produit,
      quantite: input.quantite,
      unite: input.unite,
      refGaine: input.refGaine,
      refSemencePlant: input.refSemencePlant,
      operateurNom: input.operateurNom,
    },
  });
  await emit('planche.entrant_ajoute', {
    planche_id: plancheId,
    type: e.type,
    date: input.date,
    produit: e.produit,
    quantite: e.quantite,
  });
  return e;
}

export async function listEntrants(plancheId: number) {
  await getPlanche(plancheId);
  return prisma.entrant.findMany({
    where: { plancheId },
    orderBy: { date: 'desc' },
  });
}

export async function upsertPlancheJour(plancheId: number, date: string, notes: string) {
  await getPlanche(plancheId);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new AppError('validation', 'date invalide (YYYY-MM-DD)', 422);
  }
  return prisma.plancheJour.upsert({
    where: { plancheId_date: { plancheId, date: new Date(date) } },
    create: { plancheId, date: new Date(date), notes },
    update: { notes },
  });
}

export async function getHistoriquePlanche(
  plancheId: number,
  from?: string,
  to?: string,
) {
  await getPlanche(plancheId);
  const dateFilter = {
    ...(from || to
      ? {
          date: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        }
      : {}),
  };
  const [travaux, entrants, jours, images] = await Promise.all([
    prisma.travailSol.findMany({
      where: { plancheId, ...dateFilter },
      orderBy: { date: 'asc' },
    }),
    prisma.entrant.findMany({
      where: { plancheId, ...dateFilter },
      orderBy: { date: 'asc' },
    }),
    prisma.plancheJour.findMany({
      where: { plancheId, ...dateFilter },
      orderBy: { date: 'asc' },
    }),
    prisma.plancheImage.findMany({
      where: { plancheId },
      orderBy: { ordre: 'asc' },
    }),
  ]);
  return { travaux, entrants, jours, images };
}

export async function addPlancheImage(
  plancheId: number,
  input: z.infer<typeof plancheImageCreateSchema>,
) {
  await getPlanche(plancheId);
  return prisma.plancheImage.create({
    data: {
      plancheId,
      cheminFichier: input.cheminFichier,
      legende: input.legende,
      ordre: input.ordre ?? 0,
    },
  });
}

export async function listPlancheImages(plancheId: number) {
  await getPlanche(plancheId);
  return prisma.plancheImage.findMany({
    where: { plancheId },
    orderBy: { ordre: 'asc' },
  });
}

export async function deletePlancheImage(plancheId: number, imageId: number) {
  await getPlanche(plancheId);
  const img = await prisma.plancheImage.findFirst({
    where: { id: imageId, plancheId },
  });
  if (!img) throw new AppError('not_found', `Image ${imageId} introuvable`, 404);
  await prisma.plancheImage.delete({ where: { id: imageId } });
}
