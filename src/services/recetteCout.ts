import { prisma } from '@/lib/prisma';
import { toUniteAchat } from '@/lib/units';
import { currentPrix } from './matierePrix';
import { getRecette } from './recette';

export type CoutMatiereResult = {
  coutMatiereKg: number | null;
  coutPartiel: boolean;
  modeQuantite: 'proportions' | 'absolu';
  tempsMoMinutes: number;
};

export async function computeCoutMatiere(recetteId: number): Promise<CoutMatiereResult> {
  const recette = await getRecette(recetteId);
  const [ingredients, etapes] = await Promise.all([
    prisma.recetteIngredient.findMany({
      where: { recetteId },
      include: { matiere: true },
      orderBy: { ordre: 'asc' },
    }),
    prisma.etapeRecette.findMany({ where: { recetteId } }),
  ]);

  const tempsMoMinutes = etapes.reduce((s, e) => s + e.tempsMainOeuvre, 0);
  const modeQuantite = recette.modeQuantite;

  if (ingredients.length === 0) {
    return {
      coutMatiereKg: null,
      coutPartiel: false,
      modeQuantite,
      tempsMoMinutes,
    };
  }

  let coutPartiel = false;
  const lines: { quantite: number; prix: number | null; convertible: boolean }[] = [];

  for (const ing of ingredients) {
    const prix = await currentPrix(ing.matiereId);
    const qtyAchat = toUniteAchat(
      ing.quantite,
      ing.unite,
      ing.matiere.uniteAchat,
      ing.poidsEquivG,
    );

    // En proportions, l'unité "part" n'a pas besoin de conversion vers uniteAchat
    const isProportionLine = modeQuantite === 'proportions';
    const convertible = isProportionLine
      ? true
      : qtyAchat != null;

    if (prix == null || (!isProportionLine && qtyAchat == null)) {
      coutPartiel = true;
    }

    lines.push({
      quantite: isProportionLine ? ing.quantite : (qtyAchat ?? 0),
      prix,
      convertible,
    });
  }

  if (modeQuantite === 'proportions') {
    const sumQ = lines.reduce((s, l) => s + l.quantite, 0);
    if (sumQ <= 0) {
      return { coutMatiereKg: null, coutPartiel: true, modeQuantite, tempsMoMinutes };
    }
    let cout = 0;
    let anyPriced = false;
    for (const l of lines) {
      if (l.prix == null) {
        coutPartiel = true;
        continue;
      }
      anyPriced = true;
      cout += (l.quantite / sumQ) * l.prix;
    }
    return {
      coutMatiereKg: anyPriced ? cout : null,
      coutPartiel,
      modeQuantite,
      tempsMoMinutes,
    };
  }

  // mode absolu
  const quantiteSortie = recette.quantiteSortie;
  if (quantiteSortie == null || quantiteSortie <= 0) {
    return { coutMatiereKg: null, coutPartiel: true, modeQuantite, tempsMoMinutes };
  }

  let coutLot = 0;
  let anyPriced = false;
  for (const l of lines) {
    if (!l.convertible || l.prix == null) {
      coutPartiel = true;
      continue;
    }
    anyPriced = true;
    coutLot += l.quantite * l.prix;
  }

  return {
    coutMatiereKg: anyPriced ? coutLot / quantiteSortie : null,
    coutPartiel,
    modeQuantite,
    tempsMoMinutes,
  };
}
