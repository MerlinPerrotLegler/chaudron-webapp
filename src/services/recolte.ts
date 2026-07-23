import { randomUUID } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import { emit } from '@/lib/webhooks';
import { parseDateOnly } from '@/lib/dates';
import { getLot, updateLot } from './lotCulture';
import type { RecolteCreateInput } from '@/lib/validation/lot';

/** Stub Stock (domaine D) — no-op tant que D n’existe pas. */
export async function stubEntreeStockDepuisRecolte(_payload: {
  matiereId: number;
  poidsKg: number;
  date: string;
  recolteId: number;
}): Promise<number | null> {
  return null;
}

export async function declareRecolte(input: RecolteCreateInput) {
  const lot = await getLot(input.lotId);
  if (lot.archive) throw new AppError('conflict', 'Lot archivé', 409);

  const matiere = await prisma.matiere.findUnique({ where: { id: input.matiereId } });
  if (!matiere || matiere.archivee) {
    throw new AppError('not_found', `Matière ${input.matiereId} introuvable`, 404);
  }
  if (matiere.provenance !== 'fermiere') {
    throw new AppError('validation', 'La matière de récolte doit être fermière', 422);
  }
  if (matiere.especeId !== lot.especeId) {
    throw new AppError(
      'validation',
      'La matière doit être liée à l’espèce du lot',
      422,
    );
  }

  const campagneId = input.campagneId ?? undefined;

  const r = await prisma.recolte.create({
    data: {
      lotId: input.lotId,
      date: parseDateOnly(input.date),
      poidsKg: input.poidsKg,
      matiereId: input.matiereId,
      qualite: input.qualite ?? 'A',
      qualiteNotes: input.qualiteNotes,
      numerosSacs: input.numerosSacs ?? undefined,
      emplacement: input.emplacement,
      datePeremption: input.datePeremption
        ? parseDateOnly(input.datePeremption)
        : undefined,
      campagneId,
      notes: input.notes,
      operateurNom: input.operateurNom,
    },
  });

  const stockId = await stubEntreeStockDepuisRecolte({
    matiereId: input.matiereId,
    poidsKg: input.poidsKg,
    date: input.date,
    recolteId: r.id,
  });
  if (stockId != null) {
    await prisma.recolte.update({
      where: { id: r.id },
      data: { stockMouvementId: stockId },
    });
  }

  if (lot.etat !== 'en_recolte' && lot.etat !== 'termine' && lot.etat !== 'abandonne') {
    await updateLot(lot.id, { etat: 'en_recolte' });
  }

  await emit('recolte.declaree', {
    id: r.id,
    lot_id: r.lotId,
    date: input.date,
    poids_kg: r.poidsKg,
    matiere_id: r.matiereId,
    campagne_id: r.campagneId,
    numeros_sacs: input.numerosSacs,
    emplacement: r.emplacement,
    date_peremption: input.datePeremption,
    notes: r.notes,
  });

  return prisma.recolte.findUniqueOrThrow({ where: { id: r.id } });
}

export async function listRecoltes(params: {
  lotId?: number;
  campagneId?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 50;
  const where = {
    ...(params.lotId ? { lotId: params.lotId } : {}),
    ...(params.campagneId ? { campagneId: params.campagneId } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.recolte.findMany({
      where,
      orderBy: { date: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.recolte.count({ where }),
  ]);
  return { items, total, page, pageSize };
}

export async function getRecolte(id: number) {
  const r = await prisma.recolte.findUnique({ where: { id } });
  if (!r) throw new AppError('not_found', `Récolte ${id} introuvable`, 404);
  return r;
}

export function newCampagneId() {
  return randomUUID();
}
