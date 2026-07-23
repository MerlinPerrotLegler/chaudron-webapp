import type { Provenance } from '@prisma/client';
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

export async function listMatieres(params: {
  provenance?: Provenance;
  page?: number;
  pageSize?: number;
}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 50;
  const where = {
    archivee: false,
    ...(params.provenance ? { provenance: params.provenance } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.matiere.findMany({
      where,
      orderBy: { nom: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.matiere.count({ where }),
  ]);
  return { items, total, page, pageSize };
}

export async function getMatiere(id: number) {
  const m = await prisma.matiere.findUnique({ where: { id } });
  if (!m) throw new AppError('not_found', `Matière ${id} introuvable`, 404);
  return m;
}
