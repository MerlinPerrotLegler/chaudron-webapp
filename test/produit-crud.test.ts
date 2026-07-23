import { describe, it, expect, beforeEach } from 'vitest';
import { resetDb } from './db';
import { createRecette } from '@/services/recette';
import { createConditionnement } from '@/services/conditionnement';
import { createProduit, listProduits, updateProduit, getProduit } from '@/services/produit';

beforeEach(resetDb);

describe('CRUD produits finis', () => {
  it('crée, liste, met à jour et désactive', async () => {
    const r = await createRecette({ nom: 'Herbes', famille: 'sec', type: 'transformation' });
    const c = await createConditionnement({ nom: 'Pot 100g', coutTotal: 0.3 });
    const p = await createProduit({
      recetteId: r.id,
      conditionnementId: c.id,
      poidsUnite: 0.1,
      prixVenteUnite: 5,
    });
    expect(p.actif).toBe(true);
    expect((await listProduits({ actif: true })).total).toBe(1);
    expect((await getProduit(p.id)).recette.nom).toBe('Herbes');
    const u = await updateProduit(p.id, { actif: false });
    expect(u.actif).toBe(false);
    expect((await listProduits({ actif: true })).total).toBe(0);
  });
});
