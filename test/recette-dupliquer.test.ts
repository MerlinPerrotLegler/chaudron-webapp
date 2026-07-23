import { describe, it, expect, beforeEach, vi } from 'vitest';
import { resetDb } from './db';
import * as webhooks from '@/lib/webhooks';
import { createMatiere } from '@/services/matiere';
import { createRecette, dupliquerRecette } from '@/services/recette';
import { addIngredient } from '@/services/recetteIngredient';
import { addEtape } from '@/services/recetteEtape';
import { createEquipement } from '@/services/equipement';
import { listIngredients } from '@/services/recetteIngredient';
import { listEtapes } from '@/services/recetteEtape';

beforeEach(resetDb);

describe('dupliquerRecette + webhooks', () => {
  it('clone nom, ingrédients et étapes', async () => {
    const m = await createMatiere({ nom: 'Thym', provenance: 'importation', uniteAchat: 'kg' });
    const eq = await createEquipement({ nom: 'Bassine' });
    const r = await createRecette({
      nom: 'Original',
      famille: 'sec',
      type: 'transformation',
      description: 'desc',
    });
    await addIngredient(r.id, { matiereId: m.id, quantite: 2, unite: 'part' });
    await addEtape(r.id, {
      description: 'Mélanger',
      tempsMainOeuvre: 5,
      equipementIds: [eq.id],
    });

    const copy = await dupliquerRecette(r.id);
    expect(copy.nom).toBe('Original (copie)');
    expect(copy.description).toBe('desc');
    expect(await listIngredients(copy.id)).toHaveLength(1);
    expect(await listEtapes(copy.id)).toHaveLength(1);
    expect((await listEtapes(copy.id))[0].equipements).toHaveLength(1);
  });

  it('émet recette.creee à la création', async () => {
    const spy = vi.spyOn(webhooks, 'emit').mockResolvedValue();
    await createRecette({ nom: 'Webhook', famille: 'sec', type: 'transformation' });
    expect(spy).toHaveBeenCalledWith(
      'recette.creee',
      expect.objectContaining({ nom: 'Webhook' }),
    );
    spy.mockRestore();
  });
});
