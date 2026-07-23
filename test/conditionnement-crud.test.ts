import { describe, it, expect, beforeEach } from 'vitest';
import { resetDb } from './db';
import {
  createConditionnement,
  listConditionnements,
  getConditionnement,
  updateConditionnement,
  archiveConditionnement,
} from '@/services/conditionnement';
import { createRecette } from '@/services/recette';
import { createProduit } from '@/services/produit';

beforeEach(resetDb);

describe('CRUD conditionnement', () => {
  it('crée avec coutTotal = somme si non fourni', async () => {
    const c = await createConditionnement({
      nom: 'Pot 100g',
      coutContenant: 0.2,
      coutBouchon: 0.05,
      coutEtiquette: 0.03,
    });
    expect(c.coutTotal).toBeCloseTo(0.28);
  });

  it('liste / maj / archive', async () => {
    const c = await createConditionnement({ nom: 'Sachet', coutTotal: 0.1 });
    expect((await listConditionnements({})).total).toBe(1);
    expect((await getConditionnement(c.id)).nom).toBe('Sachet');
    const u = await updateConditionnement(c.id, { contenance: 50 });
    expect(u.contenance).toBe(50);
    expect((await archiveConditionnement(c.id)).archive).toBe(true);
    expect((await listConditionnements({})).total).toBe(0);
  });

  it('refuse d’archiver si produit actif (409)', async () => {
    const c = await createConditionnement({ nom: 'Pot', coutTotal: 0.2 });
    const r = await createRecette({ nom: 'R', famille: 'sec', type: 'transformation' });
    await createProduit({
      recetteId: r.id,
      conditionnementId: c.id,
      poidsUnite: 0.1,
    });
    await expect(archiveConditionnement(c.id)).rejects.toMatchObject({
      code: 'conflict',
      status: 409,
    });
  });
});
