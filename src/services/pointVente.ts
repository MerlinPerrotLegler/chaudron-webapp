import type { TypePointVente } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import { parseDateOnly } from '@/lib/dates';

export async function createPointVente(input: {
  nom: string;
  type: TypePointVente;
  contact?: string;
  joursLivraisonHabituels?: number[];
  notes?: string;
}) {
  const existing = await prisma.pointVente.findUnique({ where: { nom: input.nom } });
  if (existing) {
    throw new AppError('conflict', `Point de vente « ${input.nom} » existe déjà`, 409);
  }
  return prisma.pointVente.create({
    data: {
      nom: input.nom,
      type: input.type,
      contact: input.contact,
      joursLivraisonHabituels:
        input.joursLivraisonHabituels === undefined
          ? undefined
          : (input.joursLivraisonHabituels as Prisma.InputJsonValue),
      notes: input.notes,
    },
  });
}

export async function listPointsVente(params: { archive?: boolean } = {}) {
  return prisma.pointVente.findMany({
    where: { archive: params.archive ?? false },
    orderBy: { nom: 'asc' },
  });
}

export async function getPointVente(id: number) {
  const p = await prisma.pointVente.findUnique({ where: { id } });
  if (!p) throw new AppError('not_found', `Point de vente ${id} introuvable`, 404);
  return p;
}

export async function updatePointVente(
  id: number,
  input: Partial<{
    nom: string;
    type: TypePointVente;
    contact: string | null;
    joursLivraisonHabituels: number[] | null;
    notes: string | null;
  }>,
) {
  await getPointVente(id);
  if (input.nom) {
    const clash = await prisma.pointVente.findFirst({
      where: { nom: input.nom, NOT: { id } },
    });
    if (clash) {
      throw new AppError('conflict', `Point de vente « ${input.nom} » existe déjà`, 409);
    }
  }
  return prisma.pointVente.update({
    where: { id },
    data: {
      nom: input.nom,
      type: input.type,
      contact: input.contact,
      notes: input.notes,
      joursLivraisonHabituels:
        input.joursLivraisonHabituels === undefined
          ? undefined
          : input.joursLivraisonHabituels === null
            ? Prisma.JsonNull
            : (input.joursLivraisonHabituels as Prisma.InputJsonValue),
    },
  });
}

export async function archivePointVente(id: number) {
  await getPointVente(id);
  return prisma.pointVente.update({ where: { id }, data: { archive: true } });
}

export async function addDateLivraison(
  pointVenteId: number,
  input: { date: string; notes?: string },
) {
  await getPointVente(pointVenteId);
  return prisma.pointVenteDateLivraison.create({
    data: {
      pointVenteId,
      date: parseDateOnly(input.date),
      notes: input.notes,
    },
  });
}

export async function listDatesLivraison(pointVenteId: number) {
  await getPointVente(pointVenteId);
  return prisma.pointVenteDateLivraison.findMany({
    where: { pointVenteId },
    orderBy: { date: 'asc' },
  });
}

export async function deleteDateLivraison(pointVenteId: number, date: string) {
  await getPointVente(pointVenteId);
  await prisma.pointVenteDateLivraison.delete({
    where: {
      pointVenteId_date: {
        pointVenteId,
        date: parseDateOnly(date),
      },
    },
  });
}
