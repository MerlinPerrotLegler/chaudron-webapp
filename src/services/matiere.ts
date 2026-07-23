import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import type { MatiereCreateInput } from '@/lib/validation/matiere';

export async function createMatiere(input: MatiereCreateInput) {
  if (input.provenance === 'fermiere' && !input.especeId) {
    throw new AppError('validation', 'especeId est requis pour une matière fermière', 422);
  }
  const existing = await prisma.matiere.findUnique({ where: { nom: input.nom } });
  if (existing) {
    throw new AppError('conflict', `Une matière nommée « ${input.nom} » existe déjà`, 409);
  }
  return prisma.matiere.create({ data: input });
}
