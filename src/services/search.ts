import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/errors';

export async function searchGlobal(q: string) {
  const term = q.trim();
  if (term.length < 2) {
    throw new AppError('validation', 'q doit contenir au moins 2 caractères', 422);
  }

  const [matieres, recettes, produits, especes, planches, clients, commandes] =
    await Promise.all([
      prisma.matiere.findMany({
        where: { archivee: false, nom: { contains: term } },
        take: 10,
        select: { id: true, nom: true, provenance: true },
      }),
      prisma.recette.findMany({
        where: { archivee: false, nom: { contains: term } },
        take: 10,
        select: { id: true, nom: true, famille: true },
      }),
      prisma.produitFini.findMany({
        where: {
          actif: true,
          OR: [
            { recette: { nom: { contains: term } } },
            { conditionnement: { nom: { contains: term } } },
          ],
        },
        take: 10,
        select: {
          id: true,
          recette: { select: { nom: true } },
          conditionnement: { select: { nom: true } },
        },
      }),
      prisma.espece.findMany({
        where: { archivee: false, nom: { contains: term } },
        take: 10,
        select: { id: true, nom: true },
      }),
      prisma.planche.findMany({
        where: { archivee: false, code: { contains: term } },
        take: 10,
        select: { id: true, code: true },
      }),
      prisma.client.findMany({
        where: { archive: false, nom: { contains: term } },
        take: 10,
        select: { id: true, nom: true },
      }),
      prisma.commande.findMany({
        where: {
          OR: [
            { reference: { contains: term } },
            { client: { nom: { contains: term } } },
          ],
        },
        take: 10,
        select: {
          id: true,
          reference: true,
          statut: true,
          client: { select: { nom: true } },
        },
      }),
    ]);

  return {
    matieres,
    recettes,
    produits: produits.map((p) => ({
      id: p.id,
      nom: `${p.recette.nom} — ${p.conditionnement.nom}`,
    })),
    especes,
    planches,
    clients,
    commandes,
  };
}
