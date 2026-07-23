import { describe, it, expect, beforeEach } from 'vitest';
import { resetDb } from './db';
import {
  createRecette,
  listRecettes,
  getRecette,
  updateRecette,
  archiveRecette,
} from '@/services/recette';

beforeEach(resetDb);

describe('CRUD recette', () => {
  it('crée une recette de transformation', async () => {
    const r = await createRecette({
      nom: 'Herbes de Provence',
      famille: 'sec',
      type: 'transformation',
      modeQuantite: 'proportions',
    });
    expect(r.id).toBeGreaterThan(0);
    expect(r.archivee).toBe(false);
  });

  it('refuse un nom en doublon (409)', async () => {
    await createRecette({ nom: 'Sel aromatisé', famille: 'sel', type: 'transformation' });
    await expect(
      createRecette({ nom: 'Sel aromatisé', famille: 'sel', type: 'transformation' }),
    ).rejects.toMatchObject({ code: 'conflict', status: 409 });
  });

  it('liste / lit / met à jour / archive', async () => {
    const r = await createRecette({
      nom: 'Sirop thym',
      famille: 'sirop',
      type: 'transformation',
    });
    expect((await listRecettes({})).total).toBe(1);
    expect((await getRecette(r.id)).nom).toBe('Sirop thym');
    const u = await updateRecette(r.id, { description: 'Lot été' });
    expect(u.description).toBe('Lot été');
    expect((await archiveRecette(r.id)).archivee).toBe(true);
    expect((await listRecettes({})).total).toBe(0);
  });
});
