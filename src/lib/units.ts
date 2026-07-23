export type UniteAchat = 'kg' | 'L' | 'piece';

/**
 * Convertit une quantité de ligne d'ingrédient vers l'unité d'achat de la matière.
 * Renvoie null si la conversion est impossible.
 */
export function toUniteAchat(
  quantite: number,
  uniteLigne: string,
  uniteAchat: UniteAchat,
  poidsEquivG?: number | null,
): number | null {
  const u = uniteLigne.trim();

  if (uniteAchat === 'kg') {
    if (u === 'kg') return quantite;
    if (u === 'g') return quantite / 1000;
    if (poidsEquivG != null && poidsEquivG > 0) {
      return (quantite * poidsEquivG) / 1000;
    }
    return null;
  }

  if (uniteAchat === 'L') {
    if (u === 'L') return quantite;
    if (u === 'mL') return quantite / 1000;
    return null;
  }

  if (uniteAchat === 'piece') {
    if (u === 'piece') return quantite;
    return null;
  }

  return null;
}
