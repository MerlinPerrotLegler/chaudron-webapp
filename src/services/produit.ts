import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import { emit } from '@/lib/webhooks';
import { getRecette } from './recette';
import { getConditionnement } from './conditionnement';
import type { ProduitCreateInput, ProduitUpdateInput } from '@/lib/validation/produit';

export async function createProduit(input: ProduitCreateInput) {
  const recette = await getRecette(input.recetteId);
  if (recette.archivee) {
    throw new AppError('conflict', 'Recette archivée', 409);
  }
  const cond = await getConditionnement(input.conditionnementId);
  if (cond.archive) {
    throw new AppError('conflict', 'Conditionnement archivé', 409);
  }
  const p = await prisma.produitFini.create({
    data: {
      recetteId: input.recetteId,
      conditionnementId: input.conditionnementId,
      poidsUnite: input.poidsUnite,
      prixVenteUnite: input.prixVenteUnite,
      actif: input.actif ?? true,
    },
  });
  await emit('produit.cree', {
    id: p.id,
    recette_id: p.recetteId,
    conditionnement_id: p.conditionnementId,
    prix_vente_unite: p.prixVenteUnite,
  });
  return p;
}

export async function listProduits(params: {
  actif?: boolean;
  page?: number;
  pageSize?: number;
}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 50;
  const where = {
    ...(params.actif === undefined ? {} : { actif: params.actif }),
  };
  const [items, total] = await Promise.all([
    prisma.produitFini.findMany({
      where,
      orderBy: { id: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        recette: { select: { id: true, nom: true } },
        conditionnement: { select: { id: true, nom: true } },
      },
    }),
    prisma.produitFini.count({ where }),
  ]);
  return { items, total, page, pageSize };
}

export async function getProduit(id: number) {
  const p = await prisma.produitFini.findUnique({
    where: { id },
    include: {
      recette: { select: { id: true, nom: true } },
      conditionnement: { select: { id: true, nom: true } },
    },
  });
  if (!p) throw new AppError('not_found', `Produit ${id} introuvable`, 404);
  return p;
}

export async function updateProduit(id: number, input: ProduitUpdateInput) {
  const prev = await getProduit(id);
  if (input.conditionnementId) {
    const cond = await getConditionnement(input.conditionnementId);
    if (cond.archive) throw new AppError('conflict', 'Conditionnement archivé', 409);
  }
  const p = await prisma.produitFini.update({
    where: { id },
    data: input,
  });
  if (input.actif === false && prev.actif) {
    await emit('produit.desactive', { id: p.id });
  } else {
    await emit('produit.maj', {
      id: p.id,
      recette_id: p.recetteId,
      conditionnement_id: p.conditionnementId,
      prix_vente_unite: p.prixVenteUnite,
    });
  }
  return p;
}
