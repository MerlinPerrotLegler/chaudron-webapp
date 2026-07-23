import { describe, it, expect, beforeEach } from 'vitest';
import { resetDb } from './db';
import { createMatiere } from '@/services/matiere';
import { createEmplacement, declareAchat, soldeMatiere, sortirMatiere } from '@/services/stock';
import { currentPrix } from '@/services/matierePrix';

beforeEach(resetDb);

describe('stock matières', () => {
  it('achat crée lot + solde + prix catalogue ; FIFO sort', async () => {
    const m = await createMatiere({ nom: 'Poivre', provenance: 'importation', uniteAchat: 'kg' });
    const emp = await createEmplacement({ nom: 'Réserve' });

    await declareAchat({
      matiereId: m.id,
      date: '2026-01-01',
      quantite: 10,
      prixUnitaire: 8,
      emplacementId: emp.id,
      datePeremption: '2027-01-01',
    });
    await declareAchat({
      matiereId: m.id,
      date: '2026-02-01',
      quantite: 5,
      prixUnitaire: 9,
      datePeremption: '2026-06-01', // périme plus tôt → FIFO d'abord
    });

    expect(await soldeMatiere(m.id)).toBe(15);
    expect(await currentPrix(m.id)).toBe(9);

    const out = await sortirMatiere({
      matiereId: m.id,
      quantite: 6,
      date: '2026-03-01',
    });
    expect(out.mouvements[0].quantite).toBe(5); // lot péremption proche
    expect(out.mouvements[1].quantite).toBe(1);
    expect(await soldeMatiere(m.id)).toBe(9);
  });

  it('refuse sortie si stock insuffisant (409)', async () => {
    const m = await createMatiere({ nom: 'Sel', provenance: 'base', uniteAchat: 'kg' });
    await declareAchat({
      matiereId: m.id,
      date: '2026-01-01',
      quantite: 1,
      prixUnitaire: 1,
      ajouterPrixCatalogue: false,
    });
    await expect(
      sortirMatiere({ matiereId: m.id, quantite: 2, date: '2026-01-02' }),
    ).rejects.toMatchObject({ code: 'STOCK_INSUFFISANT', status: 409 });
  });
});
