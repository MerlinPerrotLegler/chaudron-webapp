import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import { emit } from '@/lib/webhooks';
import type {
  ConditionnementCreateInput,
  ConditionnementUpdateInput,
} from '@/lib/validation/conditionnement';

function resolveCoutTotal(input: {
  coutContenant?: number;
  coutBouchon?: number;
  coutEtiquette?: number;
  coutTotal?: number;
}, previous?: {
  coutContenant: number;
  coutBouchon: number;
  coutEtiquette: number;
  coutTotal: number;
}) {
  if (input.coutTotal !== undefined) return input.coutTotal;
  const contenant = input.coutContenant ?? previous?.coutContenant ?? 0;
  const bouchon = input.coutBouchon ?? previous?.coutBouchon ?? 0;
  const etiquette = input.coutEtiquette ?? previous?.coutEtiquette ?? 0;
  if (
    input.coutContenant !== undefined ||
    input.coutBouchon !== undefined ||
    input.coutEtiquette !== undefined ||
    !previous
  ) {
    return contenant + bouchon + etiquette;
  }
  return previous.coutTotal;
}

export async function createConditionnement(input: ConditionnementCreateInput) {
  const existing = await prisma.conditionnement.findUnique({ where: { nom: input.nom } });
  if (existing) {
    throw new AppError('conflict', `Un conditionnement nommé « ${input.nom} » existe déjà`, 409);
  }
  const coutTotal = resolveCoutTotal(input);
  const c = await prisma.conditionnement.create({
    data: {
      nom: input.nom,
      contenance: input.contenance,
      poidsNet: input.poidsNet,
      coutContenant: input.coutContenant ?? 0,
      coutBouchon: input.coutBouchon ?? 0,
      coutEtiquette: input.coutEtiquette ?? 0,
      coutTotal,
      lienContenant: input.lienContenant,
      lienBouchon: input.lienBouchon,
    },
  });
  await emit('conditionnement.maj', { id: c.id, nom: c.nom, cout_total: c.coutTotal });
  return c;
}

export async function listConditionnements(params: { page?: number; pageSize?: number }) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 50;
  const where = { archive: false };
  const [items, total] = await Promise.all([
    prisma.conditionnement.findMany({
      where,
      orderBy: { nom: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.conditionnement.count({ where }),
  ]);
  return { items, total, page, pageSize };
}

export async function getConditionnement(id: number) {
  const c = await prisma.conditionnement.findUnique({ where: { id } });
  if (!c) throw new AppError('not_found', `Conditionnement ${id} introuvable`, 404);
  return c;
}

export async function updateConditionnement(id: number, input: ConditionnementUpdateInput) {
  const prev = await getConditionnement(id);
  if (input.nom) {
    const clash = await prisma.conditionnement.findFirst({
      where: { nom: input.nom, NOT: { id } },
    });
    if (clash) {
      throw new AppError('conflict', `Un conditionnement nommé « ${input.nom} » existe déjà`, 409);
    }
  }
  const coutTotal = resolveCoutTotal(input, prev);
  const c = await prisma.conditionnement.update({
    where: { id },
    data: { ...input, coutTotal },
  });
  await emit('conditionnement.maj', { id: c.id, nom: c.nom, cout_total: c.coutTotal });
  return c;
}

export async function archiveConditionnement(id: number) {
  await getConditionnement(id);
  const actifs = await prisma.produitFini.count({
    where: { conditionnementId: id, actif: true },
  });
  if (actifs > 0) {
    throw new AppError('conflict', 'Conditionnement utilisé par des produits actifs', 409, {
      produitsActifs: actifs,
    });
  }
  return prisma.conditionnement.update({ where: { id }, data: { archive: true } });
}
