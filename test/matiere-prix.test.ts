import { describe, it, expect, beforeEach } from 'vitest';
import { resetDb } from './db';
import { createMatiere } from '@/services/matiere';
import { addPrix, listPrix, currentPrix } from '@/services/matierePrix';

let id: number;
beforeEach(async () => {
  await resetDb();
  id = (await createMatiere({ nom: 'Sel', provenance: 'base', uniteAchat: 'kg' })).id;
});

describe('historique de prix', () => {
  it('ajoute des prix et renvoie le plus récent comme courant', async () => {
    await addPrix(id, { date: '2026-01-01', prix: 1.2 });
    await addPrix(id, { date: '2026-06-01', prix: 1.5 });
    expect(await currentPrix(id)).toBe(1.5);
    const hist = await listPrix(id);
    expect(hist.map((p) => p.prix)).toEqual([1.5, 1.2]);
  });

  it('currentPrix null si aucun prix', async () => {
    expect(await currentPrix(id)).toBeNull();
  });

  it('addPrix 404 si matière absente', async () => {
    await expect(addPrix(999999, { date: '2026-01-01', prix: 1 })).rejects.toMatchObject({
      code: 'not_found',
      status: 404,
    });
  });
});
