import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import { emit } from '@/lib/webhooks';
import { parseDateOnly } from '@/lib/dates';
import { getMatiere } from './matiere';
import { sortirMatiere, entrerMatiereDepuisTransformation } from './stock';

export async function declareTransformation(input: {
  type: 'sechage' | 'distillation' | 'mondage' | 'congelation' | 'torrefaction' | 'autre';
  typeLibelle?: string;
  date: string;
  parametres?: Record<string, unknown>;
  matiereOutId: number;
  quantiteOut: number;
  lignesIn: { matiereId: number; quantite: number; notes?: string }[];
  emplacementOutId?: number;
  datePeremptionOut?: string;
  operateurNom?: string;
  notes?: string;
}) {
  if (!input.lignesIn.length) {
    throw new AppError('validation', 'Au moins une ligne entrante requise', 422);
  }
  const matiereOut = await getMatiere(input.matiereOutId);
  for (const l of input.lignesIn) {
    if (l.matiereId === input.matiereOutId) {
      throw new AppError(
        'conflict',
        'Matière entrante identique à la matière sortante',
        409,
      );
    }
    await getMatiere(l.matiereId);
  }

  const sumIn = input.lignesIn.reduce((s, l) => s + l.quantite, 0);
  const rendement = sumIn > 0 ? input.quantiteOut / sumIn : null;

  // Sorties stock d'abord
  for (const l of input.lignesIn) {
    await sortirMatiere({
      matiereId: l.matiereId,
      quantite: l.quantite,
      date: input.date,
      refType: 'transformation',
      operateurNom: input.operateurNom,
    });
  }

  const t = await prisma.transformation.create({
    data: {
      type: input.type,
      typeLibelle: input.typeLibelle,
      date: parseDateOnly(input.date),
      parametres:
        input.parametres === undefined
          ? undefined
          : (input.parametres as Prisma.InputJsonValue),
      matiereOutId: input.matiereOutId,
      quantiteOut: input.quantiteOut,
      uniteOut: matiereOut.uniteAchat,
      rendement: rendement ?? undefined,
      emplacementOutId: input.emplacementOutId,
      datePeremptionOut: input.datePeremptionOut
        ? parseDateOnly(input.datePeremptionOut)
        : undefined,
      operateurNom: input.operateurNom,
      notes: input.notes,
      statut: 'terminee',
      lignesIn: {
        create: input.lignesIn.map((l) => ({
          matiereId: l.matiereId,
          quantite: l.quantite,
          notes: l.notes,
        })),
      },
    },
    include: { lignesIn: true },
  });

  const lotOut = await entrerMatiereDepuisTransformation({
    matiereId: input.matiereOutId,
    quantite: input.quantiteOut,
    date: input.date,
    emplacementId: input.emplacementOutId,
    datePeremption: input.datePeremptionOut,
    transformationId: t.id,
    operateurNom: input.operateurNom,
  });

  const updated = await prisma.transformation.update({
    where: { id: t.id },
    data: { lotStockMatiereOutId: lotOut.id },
    include: { lignesIn: true },
  });

  await emit('transformation.declaree', {
    id: updated.id,
    type: updated.type,
    matiere_out_id: updated.matiereOutId,
    quantite_out: updated.quantiteOut,
    rendement: updated.rendement,
  });

  return updated;
}

export async function listTransformations(params: {
  page?: number;
  pageSize?: number;
}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 50;
  const [items, total] = await Promise.all([
    prisma.transformation.findMany({
      orderBy: { date: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        matiereOut: { select: { id: true, nom: true } },
        lignesIn: {
          include: { matiere: { select: { id: true, nom: true } } },
        },
      },
    }),
    prisma.transformation.count(),
  ]);
  return { items, total, page, pageSize };
}

export async function getTransformation(id: number) {
  const t = await prisma.transformation.findUnique({
    where: { id },
    include: {
      matiereOut: { select: { id: true, nom: true } },
      lignesIn: {
        include: { matiere: { select: { id: true, nom: true } } },
      },
    },
  });
  if (!t) throw new AppError('not_found', `Transformation ${id} introuvable`, 404);
  return t;
}
