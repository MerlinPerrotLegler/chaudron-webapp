import { describe, it, expect, beforeEach } from 'vitest';
import { resetDb } from './db';
import { createMatiere } from '@/services/matiere';
import { addPrix } from '@/services/matierePrix';
import { createRecette } from '@/services/recette';
import { addIngredient } from '@/services/recetteIngredient';
import { addEtape } from '@/services/recetteEtape';
import { createConditionnement } from '@/services/conditionnement';
import { createProduit } from '@/services/produit';
import { updateParametres } from '@/services/parametres';
import { computeRevient } from '@/services/produitRevient';

beforeEach(resetDb);

describe('computeRevient', () => {
  it('calcule revient et marge', async () => {
    const m = await createMatiere({ nom: 'Thym', provenance: 'importation', uniteAchat: 'kg' });
    await addPrix(m.id, { date: '2026-01-01', prix: 20 }); // €/kg

    const r = await createRecette({
      nom: 'Thym sec',
      famille: 'sec',
      type: 'transformation',
      modeQuantite: 'proportions',
      quantiteSortie: 1, // 1 kg de sortie
      uniteSortie: 'kg',
      rendementRatioTravail: 1,
    });
    await addIngredient(r.id, { matiereId: m.id, quantite: 1, unite: 'part' });
    await addEtape(r.id, { description: 'Sécher', tempsMainOeuvre: 60 }); // 60 min

    const c = await createConditionnement({ nom: 'Pot', coutTotal: 0.5 });
    await updateParametres({ tauxHoraireMainOeuvre: 30, inclureMo: true }); // 30 €/h

    const p = await createProduit({
      recetteId: r.id,
      conditionnementId: c.id,
      poidsUnite: 0.1, // 0.1 kg → 10 unités / lot
      prixVenteUnite: 5,
    });

    const rev = await computeRevient(p.id);
    // cout_matiere_kg = 20 ; cout_matiere_unite = 20 * 0.1 = 2
    // nb_unites = 1/0.1 = 10 ; temps_mo_unite = 60/10 = 6 min ; cout_mo = 6/60 * 30 = 3
    // revient = 2 + 0.5 + 3 = 5.5 ; marge = 5 - 5.5 = -0.5
    expect(rev.partiel).toBe(false);
    expect(rev.coutMatiereUnite).toBeCloseTo(2);
    expect(rev.coutConditionnement).toBeCloseTo(0.5);
    expect(rev.coutMoUnite).toBeCloseTo(3);
    expect(rev.prixRevientUnite).toBeCloseTo(5.5);
    expect(rev.margeUnite).toBeCloseTo(-0.5);
    expect(rev.margePct).toBeCloseTo(-0.1);
    expect(rev.margeKg).toBeCloseTo(-5);
  });
});
