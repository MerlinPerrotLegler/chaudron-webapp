import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import { computeCoutMatiere } from './recetteCout';
import { getParametres } from './parametres';
import { getProduit } from './produit';

export type RevientResult = {
  partiel: boolean;
  nbUnitesLot: number | null;
  tempsMoUniteMinutes: number | null;
  coutMatiereUnite: number | null;
  coutConditionnement: number;
  coutMoUnite: number | null;
  prixRevientUnite: number | null;
  prixVenteUnite: number | null;
  margeUnite: number | null;
  margePct: number | null;
  margeKg: number | null;
  detail: {
    coutMatiereKg: number | null;
    coutPartielRecette: boolean;
    tempsMoRecette: number;
    rendementRatioTravail: number;
    tauxHoraire: number;
    inclureMo: boolean;
  };
};

export async function computeRevient(produitId: number): Promise<RevientResult> {
  const produit = await getProduit(produitId);
  const recette = await prisma.recette.findUniqueOrThrow({ where: { id: produit.recetteId } });
  const conditionnement = await prisma.conditionnement.findUniqueOrThrow({
    where: { id: produit.conditionnementId },
  });
  const params = await getParametres();
  const cout = await computeCoutMatiere(recette.id);

  let partiel = cout.coutPartiel || cout.coutMatiereKg == null;
  const quantiteSortie = recette.quantiteSortie;
  const poidsUnite = produit.poidsUnite;

  let nbUnitesLot: number | null = null;
  if (quantiteSortie != null && quantiteSortie > 0 && poidsUnite > 0) {
    // V1 : on suppose quantite_sortie et poids_unite dans la même grandeur (kg ou L)
    nbUnitesLot = quantiteSortie / poidsUnite;
  } else {
    partiel = true;
  }

  const tempsMoUniteMinutes =
    nbUnitesLot != null && nbUnitesLot > 0 ? cout.tempsMoMinutes / nbUnitesLot : null;

  const coutMatiereUnite =
    cout.coutMatiereKg != null
      ? (cout.coutMatiereKg * poidsUnite) / recette.rendementRatioTravail
      : null;

  const coutConditionnement = conditionnement.coutTotal;

  let coutMoUnite: number | null = null;
  if (tempsMoUniteMinutes != null) {
    const brut = (tempsMoUniteMinutes / 60) * params.tauxHoraireMainOeuvre;
    coutMoUnite = params.inclureMo ? brut : 0;
  } else {
    partiel = true;
  }

  let prixRevientUnite: number | null = null;
  if (coutMatiereUnite != null && coutMoUnite != null) {
    prixRevientUnite = coutMatiereUnite + coutConditionnement + coutMoUnite;
  } else {
    partiel = true;
  }

  const prixVente = produit.prixVenteUnite;
  const margeUnite =
    prixRevientUnite != null && prixVente != null ? prixVente - prixRevientUnite : null;
  const margePct =
    margeUnite != null && prixVente != null && prixVente > 0 ? margeUnite / prixVente : null;
  const margeKg = margeUnite != null && poidsUnite > 0 ? margeUnite / poidsUnite : null;

  return {
    partiel,
    nbUnitesLot,
    tempsMoUniteMinutes,
    coutMatiereUnite,
    coutConditionnement,
    coutMoUnite,
    prixRevientUnite,
    prixVenteUnite: prixVente,
    margeUnite,
    margePct,
    margeKg,
    detail: {
      coutMatiereKg: cout.coutMatiereKg,
      coutPartielRecette: cout.coutPartiel,
      tempsMoRecette: cout.tempsMoMinutes,
      rendementRatioTravail: recette.rendementRatioTravail,
      tauxHoraire: params.tauxHoraireMainOeuvre,
      inclureMo: params.inclureMo,
    },
  };
}

export async function getRevientOrThrow(produitId: number) {
  if (!(await prisma.produitFini.findUnique({ where: { id: produitId } }))) {
    throw new AppError('not_found', `Produit ${produitId} introuvable`, 404);
  }
  return computeRevient(produitId);
}
