import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';
import { resetDb } from './db';
import {
  createMatiere,
  updateMatiere,
  archiveMatiere,
  getMatiereUsages,
} from '@/services/matiere';

beforeEach(resetDb);

describe('update/archive matiere', () => {
  it('met à jour un champ', async () => {
    const m = await createMatiere({ nom: 'Sel', provenance: 'base', uniteAchat: 'kg' });
    const u = await updateMatiere(m.id, { fournisseur: 'Guérande' });
    expect(u.fournisseur).toBe('Guérande');
  });

  it('archive une matière non référencée', async () => {
    const m = await createMatiere({ nom: 'Sucre', provenance: 'base', uniteAchat: 'kg' });
    const a = await archiveMatiere(m.id);
    expect(a.archivee).toBe(true);
  });

  it("refuse d'archiver une matière utilisée (409) et la liste dans usages", async () => {
    const m = await createMatiere({
      nom: 'Thym séché',
      provenance: 'importation',
      uniteAchat: 'kg',
    });
    const r = await prisma.recette.create({
      data: { nom: 'Herbes', famille: 'sec', type: 'transformation' },
    });
    await prisma.recetteIngredient.create({
      data: { recetteId: r.id, matiereId: m.id, quantite: 1, unite: 'part' },
    });
    await expect(archiveMatiere(m.id)).rejects.toMatchObject({ code: 'conflict', status: 409 });
    const usages = await getMatiereUsages(m.id);
    expect(usages.recettes).toEqual([{ id: r.id, nom: 'Herbes' }]);
  });
});
