import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import type { EspeceCreateInput, EspeceUpdateInput } from '@/lib/validation/espece';

export async function createEspece(input: EspeceCreateInput) {
  const existing = await prisma.espece.findUnique({ where: { nom: input.nom } });
  if (existing) {
    throw new AppError('conflict', `Une espèce « ${input.nom} » existe déjà`, 409);
  }
  return prisma.espece.create({ data: input });
}

export async function listEspeces(params: { page?: number; pageSize?: number }) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 50;
  const where = { archivee: false };
  const [items, total] = await Promise.all([
    prisma.espece.findMany({
      where,
      orderBy: { nom: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.espece.count({ where }),
  ]);
  return { items, total, page, pageSize };
}

export async function getEspece(id: number) {
  const e = await prisma.espece.findUnique({
    where: { id },
    include: {
      itineraires: { orderBy: { ordre: 'asc' } },
      associations: true,
      risques: true,
      faisabilites: true,
    },
  });
  if (!e) throw new AppError('not_found', `Espèce ${id} introuvable`, 404);
  return e;
}

export async function updateEspece(id: number, input: EspeceUpdateInput) {
  await getEspece(id);
  if (input.nom) {
    const clash = await prisma.espece.findFirst({ where: { nom: input.nom, NOT: { id } } });
    if (clash) {
      throw new AppError('conflict', `Une espèce « ${input.nom} » existe déjà`, 409);
    }
  }
  return prisma.espece.update({ where: { id }, data: input });
}

export async function archiveEspece(id: number) {
  await getEspece(id);
  const lots = await prisma.lotCulture.count({
    where: { especeId: id, archive: false, etat: { notIn: ['termine', 'abandonne'] } },
  });
  if (lots > 0) {
    throw new AppError('conflict', 'Espèce utilisée par des lots actifs', 409, { lots });
  }
  return prisma.espece.update({ where: { id }, data: { archivee: true } });
}
