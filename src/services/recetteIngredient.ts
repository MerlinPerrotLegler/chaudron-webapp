import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import { getRecette } from './recette';
import type { IngredientCreateInput, IngredientUpdateInput } from '@/lib/validation/recette';

export async function listIngredients(recetteId: number) {
  await getRecette(recetteId);
  return prisma.recetteIngredient.findMany({
    where: { recetteId },
    orderBy: { ordre: 'asc' },
  });
}

export async function addIngredient(recetteId: number, input: IngredientCreateInput) {
  await getRecette(recetteId);
  const matiere = await prisma.matiere.findUnique({ where: { id: input.matiereId } });
  if (!matiere || matiere.archivee) {
    throw new AppError('not_found', `Matière ${input.matiereId} introuvable`, 404);
  }
  return prisma.recetteIngredient.create({
    data: {
      recetteId,
      matiereId: input.matiereId,
      quantite: input.quantite,
      unite: input.unite,
      ordre: input.ordre ?? 0,
      poidsEquivG: input.poidsEquivG,
    },
  });
}

export async function updateIngredient(
  recetteId: number,
  ingredientId: number,
  input: IngredientUpdateInput,
) {
  await getRecette(recetteId);
  const line = await prisma.recetteIngredient.findFirst({
    where: { id: ingredientId, recetteId },
  });
  if (!line) {
    throw new AppError('not_found', `Ingrédient ${ingredientId} introuvable`, 404);
  }
  if (input.matiereId) {
    const matiere = await prisma.matiere.findUnique({ where: { id: input.matiereId } });
    if (!matiere || matiere.archivee) {
      throw new AppError('not_found', `Matière ${input.matiereId} introuvable`, 404);
    }
  }
  return prisma.recetteIngredient.update({ where: { id: ingredientId }, data: input });
}

export async function removeIngredient(recetteId: number, ingredientId: number) {
  await getRecette(recetteId);
  const line = await prisma.recetteIngredient.findFirst({
    where: { id: ingredientId, recetteId },
  });
  if (!line) {
    throw new AppError('not_found', `Ingrédient ${ingredientId} introuvable`, 404);
  }
  await prisma.recetteIngredient.delete({ where: { id: ingredientId } });
}
