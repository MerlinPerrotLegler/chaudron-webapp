import type { FamilleRecette, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import { emit } from '@/lib/webhooks';
import type { RecetteCreateInput, RecetteUpdateInput } from '@/lib/validation/recette';

export async function createRecette(input: RecetteCreateInput) {
  const existing = await prisma.recette.findUnique({ where: { nom: input.nom } });
  if (existing) {
    throw new AppError('conflict', `Une recette nommée « ${input.nom} » existe déjà`, 409);
  }
  const { tags, ...rest } = input;
  const r = await prisma.recette.create({
    data: {
      ...rest,
      ...(tags !== undefined ? { tags } : {}),
    },
  });
  await emit('recette.creee', { id: r.id, nom: r.nom, famille: r.famille });
  return r;
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
  const r = await prisma.recette.update({
    where: { id },
    data: {
      ...rest,
      ...(tags !== undefined ? { tags } : {}),
    },
  });
  await emit('recette.maj', { id: r.id, nom: r.nom, famille: r.famille });
  return r;
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

export async function dupliquerRecette(id: number) {
  const source = await prisma.recette.findUnique({
    where: { id },
    include: {
      ingredients: { orderBy: { ordre: 'asc' } },
      etapes: {
        orderBy: { ordre: 'asc' },
        include: { equipements: true },
      },
    },
  });
  if (!source) throw new AppError('not_found', `Recette ${id} introuvable`, 404);

  let nom = `${source.nom} (copie)`;
  let n = 2;
  while (await prisma.recette.findUnique({ where: { nom } })) {
    nom = `${source.nom} (copie ${n})`;
    n += 1;
  }

  const copy = await prisma.$transaction(async (tx) => {
    const r = await tx.recette.create({
      data: {
        nom,
        description: source.description,
        tags: source.tags === null ? Prisma.JsonNull : source.tags,
        famille: source.famille,
        type: source.type,
        categorieId: source.categorieId,
        modeQuantite: source.modeQuantite,
        quantiteSortie: source.quantiteSortie,
        uniteSortie: source.uniteSortie,
        lotRefLibelle: source.lotRefLibelle,
        rendementRatioTravail: source.rendementRatioTravail,
        notesVariante: source.notesVariante,
      },
    });

    for (const ing of source.ingredients) {
      await tx.recetteIngredient.create({
        data: {
          recetteId: r.id,
          matiereId: ing.matiereId,
          ordre: ing.ordre,
          quantite: ing.quantite,
          unite: ing.unite,
          poidsEquivG: ing.poidsEquivG,
        },
      });
    }

    for (const etape of source.etapes) {
      const e = await tx.etapeRecette.create({
        data: {
          recetteId: r.id,
          ordre: etape.ordre,
          description: etape.description,
          tempsMainOeuvre: etape.tempsMainOeuvre,
          tempsAttente: etape.tempsAttente,
          parametres:
            etape.parametres === null ? Prisma.JsonNull : etape.parametres,
        },
      });
      if (etape.equipements.length > 0) {
        await tx.etapeEquipement.createMany({
          data: etape.equipements.map((eq) => ({
            etapeId: e.id,
            equipementId: eq.equipementId,
          })),
        });
      }
    }

    return r;
  });

  await emit('recette.creee', { id: copy.id, nom: copy.nom, famille: copy.famille });
  return copy;
}
