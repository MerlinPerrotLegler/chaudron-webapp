import { prisma } from '@/lib/prisma';

/** Ordre de suppression respectant les FK. */
export async function resetDb() {
  await prisma.mouvement.deleteMany();
  await prisma.lotStockProduit.deleteMany();
  await prisma.lotStockMatiere.deleteMany();
  await prisma.achat.deleteMany();
  await prisma.emplacement.deleteMany();
  await prisma.recolte.deleteMany();
  await prisma.lotEtape.deleteMany();
  await prisma.lotCulture.deleteMany();
  await prisma.faisabilite.deleteMany();
  await prisma.risqueCulture.deleteMany();
  await prisma.association.deleteMany();
  await prisma.itineraireEtape.deleteMany();
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
  await prisma.plancheImage.deleteMany();
  await prisma.plancheJour.deleteMany();
  await prisma.travailSol.deleteMany();
  await prisma.entrant.deleteMany();
  await prisma.planche.deleteMany();
  await prisma.parcelle.deleteMany();
}
