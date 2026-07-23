import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import { getMatiere } from './matiere';
import { createRecette } from './recette';
import { addIngredient } from './recetteIngredient';

export async function creerRecetteSimple(
  matiereId: number,
  opts?: { nom?: string; famille?: 'sec' | 'autre' },
) {
  const m = await getMatiere(matiereId);
  if (m.archivee) throw new AppError('conflict', 'Matière archivée', 409);

  const nom = opts?.nom ?? `Revente ${m.nom}`;
  const famille = opts?.famille ?? 'autre';

  const r = await createRecette({
    nom,
    famille,
    type: 'simple',
    modeQuantite: 'absolu',
    quantiteSortie: 1,
    uniteSortie: m.uniteAchat === 'L' ? 'L' : m.uniteAchat === 'piece' ? 'piece' : 'kg',
    lotRefLibelle: `1 ${m.uniteAchat}`,
  });

  await addIngredient(r.id, {
    matiereId: m.id,
    quantite: 1,
    unite: m.uniteAchat,
    ordre: 0,
  });

  return prisma.recette.findUniqueOrThrow({ where: { id: r.id } });
}
