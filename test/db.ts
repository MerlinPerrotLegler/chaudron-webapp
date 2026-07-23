import { prisma } from '@/lib/prisma';

/** Ordre de suppression respectant les FK. */
export async function resetDb() {
  await prisma.etapeEquipement.deleteMany();
  await prisma.etapeRecette.deleteMany();
  await prisma.recetteIngredient.deleteMany();
  await prisma.produitFini.deleteMany();
  await prisma.recette.deleteMany();
  await prisma.matierePrix.deleteMany();
  await prisma.matiere.deleteMany();
  await prisma.espece.deleteMany();
  await prisma.conditionnement.deleteMany();
  await prisma.categorieReglementaire.deleteMany();
  await prisma.equipement.deleteMany();
  await prisma.parametres.deleteMany();
}
