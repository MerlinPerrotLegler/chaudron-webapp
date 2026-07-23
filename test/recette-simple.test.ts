import { describe, it, expect, beforeEach, vi } from 'vitest';
import { resetDb } from './db';
import * as webhooks from '@/lib/webhooks';
import { createMatiere } from '@/services/matiere';
import { creerRecetteSimple } from '@/services/recetteSimple';
import { listIngredients } from '@/services/recetteIngredient';

beforeEach(resetDb);

describe('creerRecetteSimple', () => {
  it('crée une recette type simple mono-ingrédient', async () => {
    const m = await createMatiere({ nom: 'Poivre', provenance: 'importation', uniteAchat: 'kg' });
    const spy = vi.spyOn(webhooks, 'emit').mockResolvedValue();
    const r = await creerRecetteSimple(m.id);
    expect(r.type).toBe('simple');
    expect(r.modeQuantite).toBe('absolu');
    expect(r.quantiteSortie).toBe(1);
    const ings = await listIngredients(r.id);
    expect(ings).toHaveLength(1);
    expect(ings[0].matiereId).toBe(m.id);
    expect(ings[0].quantite).toBe(1);
    expect(ings[0].unite).toBe('kg');
    expect(spy).toHaveBeenCalledWith(
      'recette.creee',
      expect.objectContaining({ nom: r.nom }),
    );
    spy.mockRestore();
  });
});
