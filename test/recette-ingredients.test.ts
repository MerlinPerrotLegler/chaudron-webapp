import { describe, it, expect, beforeEach } from 'vitest';
import { resetDb } from './db';
import { createMatiere } from '@/services/matiere';
import { createRecette } from '@/services/recette';
import {
  addIngredient,
  updateIngredient,
  removeIngredient,
  listIngredients,
} from '@/services/recetteIngredient';

beforeEach(resetDb);

describe('ingrédients de recette', () => {
  it('ajoute, met à jour et supprime des lignes', async () => {
    const r = await createRecette({ nom: 'Mélange', famille: 'sec', type: 'transformation' });
    const m1 = await createMatiere({ nom: 'Thym', provenance: 'importation', uniteAchat: 'kg' });
    const m2 = await createMatiere({ nom: 'Romarin', provenance: 'importation', uniteAchat: 'kg' });

    const i1 = await addIngredient(r.id, {
      matiereId: m1.id,
      quantite: 2,
      unite: 'part',
      ordre: 0,
    });
    await addIngredient(r.id, { matiereId: m2.id, quantite: 1, unite: 'part', ordre: 1 });

    expect((await listIngredients(r.id)).map((i) => i.matiereId)).toEqual([m1.id, m2.id]);

    const u = await updateIngredient(r.id, i1.id, { quantite: 3 });
    expect(u.quantite).toBe(3);

    await removeIngredient(r.id, i1.id);
    expect((await listIngredients(r.id)).map((i) => i.matiereId)).toEqual([m2.id]);
  });

  it('refuse une matière inconnue (404)', async () => {
    const r = await createRecette({ nom: 'X', famille: 'sec', type: 'transformation' });
    await expect(
      addIngredient(r.id, { matiereId: 999999, quantite: 1, unite: 'part' }),
    ).rejects.toMatchObject({ code: 'not_found', status: 404 });
  });
});
