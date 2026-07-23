import { describe, it, expect, beforeEach } from 'vitest';
import { resetDb } from './db';
import { createMatiere } from '@/services/matiere';

beforeEach(resetDb);

describe('createMatiere', () => {
  it("crée une matière d'importation", async () => {
    const m = await createMatiere({
      nom: 'Poivre',
      provenance: 'importation',
      uniteAchat: 'kg',
    });
    expect(m.nom).toBe('Poivre');
    expect(m.provenance).toBe('importation');
  });

  it('refuse un nom en doublon (409)', async () => {
    await createMatiere({ nom: 'Sel', provenance: 'base', uniteAchat: 'kg' });
    await expect(
      createMatiere({ nom: 'Sel', provenance: 'base', uniteAchat: 'kg' }),
    ).rejects.toMatchObject({ code: 'conflict', status: 409 });
  });

  it('exige especeId quand provenance=fermiere (422)', async () => {
    await expect(
      createMatiere({ nom: 'Thym', provenance: 'fermiere', uniteAchat: 'kg' }),
    ).rejects.toMatchObject({ code: 'validation', status: 422 });
  });
});
