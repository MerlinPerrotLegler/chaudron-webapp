import { describe, it, expect, beforeEach } from 'vitest';
import { resetDb } from './db';
import { createEspece } from '@/services/espece';
import {
  addItineraireEtape,
  addAssociation,
  upsertFaisabilite,
} from '@/services/especeRelations';
import { createParcelle } from '@/services/parcelle';
import { createPlanche } from '@/services/planche';
import { createLot, patchLotEtape, getConflitsLot } from '@/services/lotCulture';
import { createMatiere } from '@/services/matiere';
import { declareRecolte, newCampagneId } from '@/services/recolte';

beforeEach(resetDb);

describe('Culture E2–E4', () => {
  it('espèce + itinéraire → lot avec cascade de dates', async () => {
    const e = await createEspece({ nom: 'Thym', cycle: 'vivace', besoinEau: 'faible' });
    await addItineraireEtape(e.id, {
      ordre: 0,
      code: 'plantation',
      dureeDepuisPrecedenteJours: 0,
    });
    await addItineraireEtape(e.id, {
      ordre: 1,
      code: 'recolte',
      dureeDepuisPrecedenteJours: 90,
    });
    await upsertFaisabilite(e.id, { vocation: 'tunnel', niveau: 'vert' });

    const p = await createParcelle({ code: 'SA', vocation: 'tunnel' });
    const pl = await createPlanche({ parcelleId: p.id, numero: '01', surfaceM2: 20 });

    const lot = await createLot({
      especeId: e.id,
      plancheId: pl.id,
      annee: 2026,
      surfaceM2: 10,
      dateDebut: '2026-03-01',
    });

    expect(lot.etapes).toHaveLength(2);
    expect(lot.etapes[0].datePrevue?.toISOString().slice(0, 10)).toBe('2026-03-01');
    expect(lot.etapes[1].datePrevue?.toISOString().slice(0, 10)).toBe('2026-05-30');

    const updated = await patchLotEtape(lot.id, lot.etapes[0].id, {
      datePrevue: '2026-03-11',
    });
    expect(updated.etapes[1].datePrevue?.toISOString().slice(0, 10)).toBe('2026-06-09');
  });

  it('conflit si surface lot > planche', async () => {
    const e = await createEspece({ nom: 'Romarin' });
    const p = await createParcelle({ code: 'GA', vocation: 'frais' });
    const pl = await createPlanche({ parcelleId: p.id, numero: '01', surfaceM2: 5 });
    await expect(
      createLot({
        especeId: e.id,
        plancheId: pl.id,
        annee: 2026,
        surfaceM2: 10,
      }),
    ).rejects.toMatchObject({ code: 'validation', status: 422 });
  });

  it('récoltes multi-sessions avec campagne_id', async () => {
    const e = await createEspece({ nom: 'Thym citron' });
    const m = await createMatiere({
      nom: 'Thym citron frais',
      provenance: 'fermiere',
      uniteAchat: 'kg',
      especeId: e.id,
    });
    const p = await createParcelle({ code: 'SA', vocation: 'tunnel' });
    const pl = await createPlanche({ parcelleId: p.id, numero: '01', surfaceM2: 15 });
    const lot = await createLot({
      especeId: e.id,
      plancheId: pl.id,
      annee: 2026,
      surfaceM2: 10,
    });

    const campagne = newCampagneId();
    const r1 = await declareRecolte({
      lotId: lot.id,
      date: '2026-06-01',
      poidsKg: 2.5,
      matiereId: m.id,
      campagneId: campagne,
      notes: 'Pluie — interruption',
    });
    const r2 = await declareRecolte({
      lotId: lot.id,
      date: '2026-06-03',
      poidsKg: 1.2,
      matiereId: m.id,
      campagneId: campagne,
      notes: 'Reprise',
    });
    expect(r1.campagneId).toBe(campagne);
    expect(r2.campagneId).toBe(campagne);

    const autres = await createEspece({ nom: 'Basilic' });
    await addAssociation(e.id, {
      especeCibleId: autres.id,
      type: 'favorable',
    });

    const conflits = await getConflitsLot(lot.id);
    expect(conflits.conflits.some((c) => c.severity === 'error')).toBe(false);
  });
});
