import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/errors';

export async function createEquipement(input: { nom: string }) {
  const existing = await prisma.equipement.findUnique({ where: { nom: input.nom } });
  if (existing) {
    throw new AppError('conflict', `Un équipement nommé « ${input.nom} » existe déjà`, 409);
  }
  return prisma.equipement.create({ data: { nom: input.nom } });
}

export async function listEquipements() {
  return prisma.equipement.findMany({ orderBy: { nom: 'asc' } });
}

export async function getEquipement(id: number) {
  const e = await prisma.equipement.findUnique({ where: { id } });
  if (!e) throw new AppError('not_found', `Équipement ${id} introuvable`, 404);
  return e;
}
