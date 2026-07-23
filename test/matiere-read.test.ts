import { describe, it, expect, beforeEach } from 'vitest';
import { resetDb } from './db';
import { createMatiere, listMatieres, getMatiere } from '@/services/matiere';

beforeEach(async () => {
  await resetDb();
  await createMatiere({ nom: 'Sel', provenance: 'base', uniteAchat: 'kg' });
  await createMatiere({ nom: 'Poivre', provenance: 'importation', uniteAchat: 'kg' });
});

describe('lecture des matières', () => {
  it('liste toutes les matières non archivées', async () => {
    const r = await listMatieres({});
    expect(r.total).toBe(2);
    expect(r.items).toHaveLength(2);
  });

  it('filtre par provenance', async () => {
    const r = await listMatieres({ provenance: 'base' });
    expect(r.total).toBe(1);
    expect(r.items[0].nom).toBe('Sel');
  });

  it('getMatiere lève 404 si absente', async () => {
    await expect(getMatiere(999999)).rejects.toMatchObject({ code: 'not_found', status: 404 });
  });
});
