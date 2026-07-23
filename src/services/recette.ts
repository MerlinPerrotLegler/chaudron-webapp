import type { FamilleRecette } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import type { RecetteCreateInput, RecetteUpdateInput } from '@/lib/validation/recette';

export async function createRecette(input: RecetteCreateInput) {
  const existing = await prisma.recette.findUnique({ where: { nom: input.nom } });
  if (existing) {
    throw new AppError('conflict', `Une recette nommée « ${input.nom} » existe déjà`, 409);
  }
  const { tags, ...rest } = input;
  return prisma.recette.create({
    data: {
      ...rest,
      ...(tags !== undefined ? { tags } : {}),
    },
  });
}

export async function listRecettes(params: {
  famille?: FamilleRecette;
  page?: number;
  pageSize?: number;
}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 50;
  const where = {
    archivee: false,
    ...(params.famille ? { famille: params.famille } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.recette.findMany({
      where,
      orderBy: { nom: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.recette.count({ where }),
  ]);
  return { items, total, page, pageSize };
}

export async function getRecette(id: number) {
  const r = await prisma.recette.findUnique({ where: { id } });
  if (!r) throw new AppError('not_found', `Recette ${id} introuvable`, 404);
  return r;
}

export async function updateRecette(id: number, input: RecetteUpdateInput) {
  await getRecette(id);
  if (input.nom) {
    const clash = await prisma.recette.findFirst({ where: { nom: input.nom, NOT: { id } } });
    if (clash) {
      throw new AppError('conflict', `Une recette nommée « ${input.nom} » existe déjà`, 409);
    }
  }
  const { tags, ...rest } = input;
  return prisma.recette.update({
    where: { id },
    data: {
      ...rest,
      ...(tags !== undefined ? { tags } : {}),
    },
  });
}

export async function archiveRecette(id: number) {
  await getRecette(id);
  const produitsActifs = await prisma.produitFini.count({
    where: { recetteId: id, actif: true },
  });
  if (produitsActifs > 0) {
    throw new AppError(
      'conflict',
      'Recette utilisée par des produits actifs',
      409,
      { produitsActifs },
    );
  }
  return prisma.recette.update({ where: { id }, data: { archivee: true } });
}
