import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import { getRecette } from './recette';
import type { EtapeCreateInput, EtapeUpdateInput } from '@/lib/validation/recette';

async function assertEquipements(ids: number[]) {
  if (ids.length === 0) return;
  const found = await prisma.equipement.findMany({ where: { id: { in: ids } } });
  if (found.length !== ids.length) {
    throw new AppError('not_found', 'Un ou plusieurs équipements introuvables', 404);
  }
}

export async function listEtapes(recetteId: number) {
  await getRecette(recetteId);
  return prisma.etapeRecette.findMany({
    where: { recetteId },
    orderBy: { ordre: 'asc' },
    include: { equipements: true },
  });
}

export async function addEtape(recetteId: number, input: EtapeCreateInput) {
  await getRecette(recetteId);
  const equipementIds = input.equipementIds ?? [];
  await assertEquipements(equipementIds);

  return prisma.$transaction(async (tx) => {
    const etape = await tx.etapeRecette.create({
      data: {
        recetteId,
        description: input.description,
        ordre: input.ordre ?? 0,
        tempsMainOeuvre: input.tempsMainOeuvre ?? 0,
        tempsAttente: input.tempsAttente ?? 0,
        parametres:
          input.parametres === undefined
            ? undefined
            : (input.parametres as Prisma.InputJsonValue),
      },
    });
    if (equipementIds.length > 0) {
      await tx.etapeEquipement.createMany({
        data: equipementIds.map((equipementId) => ({
          etapeId: etape.id,
          equipementId,
        })),
      });
    }
    return tx.etapeRecette.findUniqueOrThrow({
      where: { id: etape.id },
      include: { equipements: true },
    });
  });
}

export async function updateEtape(
  recetteId: number,
  etapeId: number,
  input: EtapeUpdateInput,
) {
  await getRecette(recetteId);
  const existing = await prisma.etapeRecette.findFirst({
    where: { id: etapeId, recetteId },
  });
  if (!existing) {
    throw new AppError('not_found', `Étape ${etapeId} introuvable`, 404);
  }

  if (input.equipementIds) {
    await assertEquipements(input.equipementIds);
  }

  return prisma.$transaction(async (tx) => {
    const { equipementIds, parametres, ...rest } = input;
    await tx.etapeRecette.update({
      where: { id: etapeId },
      data: {
        ...rest,
        ...(parametres !== undefined
          ? { parametres: parametres as Prisma.InputJsonValue }
          : {}),
      },
    });
    if (equipementIds) {
      await tx.etapeEquipement.deleteMany({ where: { etapeId } });
      if (equipementIds.length > 0) {
        await tx.etapeEquipement.createMany({
          data: equipementIds.map((equipementId) => ({ etapeId, equipementId })),
        });
      }
    }
    return tx.etapeRecette.findUniqueOrThrow({
      where: { id: etapeId },
      include: { equipements: true },
    });
  });
}

export async function removeEtape(recetteId: number, etapeId: number) {
  await getRecette(recetteId);
  const existing = await prisma.etapeRecette.findFirst({
    where: { id: etapeId, recetteId },
  });
  if (!existing) {
    throw new AppError('not_found', `Étape ${etapeId} introuvable`, 404);
  }
  await prisma.$transaction(async (tx) => {
    await tx.etapeEquipement.deleteMany({ where: { etapeId } });
    await tx.etapeRecette.delete({ where: { id: etapeId } });
  });
}
