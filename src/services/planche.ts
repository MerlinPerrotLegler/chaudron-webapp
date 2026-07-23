import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import { emit } from '@/lib/webhooks';
import { getParcelle } from './parcelle';
import type { PlancheCreateInput, PlancheUpdateInput } from '@/lib/validation/terrain';

export async function createPlanche(input: PlancheCreateInput) {
  const parcelle = await getParcelle(input.parcelleId);
  if (parcelle.archivee) {
    throw new AppError('conflict', 'Parcelle archivée', 409);
  }
  const code = `${parcelle.code}-${input.numero}`;
  const clash = await prisma.planche.findFirst({
    where: {
      OR: [{ code }, { parcelleId: input.parcelleId, numero: input.numero }],
    },
  });
  if (clash) {
    throw new AppError('conflict', `Planche « ${code} » existe déjà`, 409);
  }
  const p = await prisma.planche.create({
    data: {
      parcelleId: input.parcelleId,
      numero: input.numero,
      code,
      surfaceM2: input.surfaceM2,
      particularites: input.particularites,
    },
  });
  await emit('planche.creee', {
    id: p.id,
    code: p.code,
    parcelle_id: p.parcelleId,
    numero: p.numero,
    surface_m2: p.surfaceM2,
  });
  return p;
}

export async function listPlanches(params: {
  parcelleId?: number;
  code?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 50;
  const where = {
    archivee: false,
    ...(params.parcelleId ? { parcelleId: params.parcelleId } : {}),
    ...(params.code ? { code: params.code } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.planche.findMany({
      where,
      orderBy: { code: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.planche.count({ where }),
  ]);
  return { items, total, page, pageSize };
}

export async function getPlanche(id: number) {
  const p = await prisma.planche.findUnique({ where: { id } });
  if (!p) throw new AppError('not_found', `Planche ${id} introuvable`, 404);
  return p;
}

export async function updatePlanche(id: number, input: PlancheUpdateInput) {
  const prev = await getPlanche(id);
  const parcelle = await getParcelle(prev.parcelleId);
  let code = prev.code;
  if (input.numero && input.numero !== prev.numero) {
    code = `${parcelle.code}-${input.numero}`;
    const clash = await prisma.planche.findFirst({
      where: {
        OR: [{ code }, { parcelleId: prev.parcelleId, numero: input.numero }],
        NOT: { id },
      },
    });
    if (clash) {
      throw new AppError('conflict', `Planche « ${code} » existe déjà`, 409);
    }
  }
  const p = await prisma.planche.update({
    where: { id },
    data: { ...input, code },
  });
  await emit('planche.maj', {
    id: p.id,
    code: p.code,
    parcelle_id: p.parcelleId,
    numero: p.numero,
    surface_m2: p.surfaceM2,
  });
  return p;
}

export async function archivePlanche(id: number) {
  await getPlanche(id);
  const lots = await prisma.lotCulture.count({
    where: {
      plancheId: id,
      archive: false,
      etat: { notIn: ['termine', 'abandonne'] },
    },
  });
  if (lots > 0) {
    throw new AppError('conflict', 'Planche avec lots actifs', 409, { lots });
  }
  return prisma.planche.update({ where: { id }, data: { archivee: true } });
}
