import type { VocationParcelle } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import { emit } from '@/lib/webhooks';
import type { ParcelleCreateInput, ParcelleUpdateInput } from '@/lib/validation/terrain';

export async function createParcelle(input: ParcelleCreateInput) {
  const existing = await prisma.parcelle.findUnique({ where: { code: input.code } });
  if (existing) {
    throw new AppError('conflict', `Une parcelle « ${input.code} » existe déjà`, 409);
  }
  const p = await prisma.parcelle.create({ data: input });
  await emit('parcelle.creee', { id: p.id, code: p.code, vocation: p.vocation });
  return p;
}

export async function listParcelles(params: {
  vocation?: VocationParcelle;
  page?: number;
  pageSize?: number;
}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 50;
  const where = {
    archivee: false,
    ...(params.vocation ? { vocation: params.vocation } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.parcelle.findMany({
      where,
      orderBy: { code: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.parcelle.count({ where }),
  ]);
  return { items, total, page, pageSize };
}

export async function getParcelle(id: number) {
  const p = await prisma.parcelle.findUnique({ where: { id } });
  if (!p) throw new AppError('not_found', `Parcelle ${id} introuvable`, 404);
  return p;
}

export async function updateParcelle(id: number, input: ParcelleUpdateInput) {
  const prev = await getParcelle(id);
  if (input.code && input.code !== prev.code) {
    const clash = await prisma.parcelle.findFirst({
      where: { code: input.code, NOT: { id } },
    });
    if (clash) {
      throw new AppError('conflict', `Une parcelle « ${input.code} » existe déjà`, 409);
    }
  }

  const p = await prisma.$transaction(async (tx) => {
    const updated = await tx.parcelle.update({ where: { id }, data: input });
    if (input.code && input.code !== prev.code) {
      const planches = await tx.planche.findMany({ where: { parcelleId: id } });
      for (const pl of planches) {
        await tx.planche.update({
          where: { id: pl.id },
          data: { code: `${input.code}-${pl.numero}` },
        });
      }
    }
    return updated;
  });

  await emit('parcelle.maj', { id: p.id, code: p.code, vocation: p.vocation });
  return p;
}

export async function archiveParcelle(id: number) {
  await getParcelle(id);
  const actives = await prisma.planche.count({
    where: { parcelleId: id, archivee: false },
  });
  if (actives > 0) {
    throw new AppError(
      'conflict',
      'Parcelle avec planches non archivées',
      409,
      { planchesActives: actives },
    );
  }
  return prisma.parcelle.update({ where: { id }, data: { archivee: true } });
}
