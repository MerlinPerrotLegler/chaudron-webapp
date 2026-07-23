import { describe, it, expect, beforeEach } from 'vitest';
import { resetDb } from './db';
import { createRecette } from '@/services/recette';
import { createEquipement } from '@/services/equipement';
import {
  addEtape,
  updateEtape,
  removeEtape,
  listEtapes,
} from '@/services/recetteEtape';

beforeEach(resetDb);

describe('étapes de recette', () => {
  it('crée une étape avec équipement, met à jour et supprime', async () => {
    const r = await createRecette({ nom: 'Sirop', famille: 'sirop', type: 'transformation' });
    const eq = await createEquipement({ nom: 'Bassine' });

    const e = await addEtape(r.id, {
      description: 'Chauffer',
      tempsMainOeuvre: 20,
      tempsAttente: 60,
      equipementIds: [eq.id],
      parametres: { temperature: 80 },
    });
    expect(e.tempsMainOeuvre).toBe(20);

    const listed = await listEtapes(r.id);
    expect(listed).toHaveLength(1);
    expect(listed[0].equipements.map((x) => x.equipementId)).toEqual([eq.id]);

    const u = await updateEtape(r.id, e.id, { tempsMainOeuvre: 30, equipementIds: [] });
    expect(u.tempsMainOeuvre).toBe(30);
    expect((await listEtapes(r.id))[0].equipements).toHaveLength(0);

    await removeEtape(r.id, e.id);
    expect(await listEtapes(r.id)).toHaveLength(0);
  });
});
