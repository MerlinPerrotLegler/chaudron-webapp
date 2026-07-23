import { describe, it, expect, beforeEach } from 'vitest';
import { resetDb } from './db';
import { createParcelle } from '@/services/parcelle';
import { createPlanche } from '@/services/planche';
import {
  addTravailSol,
  addEntrant,
  upsertPlancheJour,
  getHistoriquePlanche,
  addPlancheImage,
  listPlancheImages,
} from '@/services/plancheJournal';

beforeEach(resetDb);

describe('journals planche', () => {
  async function setup() {
    const p = await createParcelle({ code: 'SA', vocation: 'tunnel' });
    return createPlanche({ parcelleId: p.id, numero: '01', surfaceM2: 12 });
  }

  it('enregistre travaux, entrants, notes et images', async () => {
    const pl = await setup();
    await addTravailSol(pl.id, { date: '2026-03-01', type: 'binage' });
    await addEntrant(pl.id, {
      date: '2026-03-02',
      type: 'compost',
      produit: 'Compost ferme',
      quantite: 20,
      unite: 'kg',
    });
    await upsertPlancheJour(pl.id, '2026-03-01', 'Sol trop humide');
    await addPlancheImage(pl.id, {
      cheminFichier: 'uploads/planches/1/a.jpg',
      legende: 'Avant',
    });

    const h = await getHistoriquePlanche(pl.id, '2026-03-01', '2026-03-31');
    expect(h.travaux).toHaveLength(1);
    expect(h.entrants).toHaveLength(1);
    expect(h.jours[0].notes).toBe('Sol trop humide');
    expect(await listPlancheImages(pl.id)).toHaveLength(1);
  });
});
