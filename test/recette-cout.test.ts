import { describe, it, expect, beforeEach } from 'vitest';
import { resetDb } from './db';
import { createMatiere } from '@/services/matiere';
import { addPrix } from '@/services/matierePrix';
import { createRecette } from '@/services/recette';
import { addIngredient } from '@/services/recetteIngredient';
import { addEtape } from '@/services/recetteEtape';
import { computeCoutMatiere } from '@/services/recetteCout';

beforeEach(resetDb);

describe('computeCoutMatiere', () => {
  it('calcule en mode proportions (50/50 → moyenne des prix)', async () => {
    const a = await createMatiere({ nom: 'A', provenance: 'base', uniteAchat: 'kg' });
    const b = await createMatiere({ nom: 'B', provenance: 'base', uniteAchat: 'kg' });
    await addPrix(a.id, { date: '2026-01-01', prix: 10 });
    await addPrix(b.id, { date: '2026-01-01', prix: 20 });

    const r = await createRecette({
      nom: 'Mix',
      famille: 'sec',
      type: 'transformation',
      modeQuantite: 'proportions',
    });
    await addIngredient(r.id, { matiereId: a.id, quantite: 1, unite: 'part' });
    await addIngredient(r.id, { matiereId: b.id, quantite: 1, unite: 'part' });

    const c = await computeCoutMatiere(r.id);
    expect(c.coutPartiel).toBe(false);
    expect(c.coutMatiereKg).toBe(15);
    expect(c.modeQuantite).toBe('proportions');
  });

  it('calcule en mode absolu (cout_lot / quantite_sortie)', async () => {
    const a = await createMatiere({ nom: 'Sel', provenance: 'base', uniteAchat: 'kg' });
    await addPrix(a.id, { date: '2026-01-01', prix: 2 });
    const r = await createRecette({
      nom: 'Sel aromatisé',
      famille: 'sel',
      type: 'transformation',
      modeQuantite: 'absolu',
      quantiteSortie: 2,
      uniteSortie: 'kg',
    });
    await addIngredient(r.id, { matiereId: a.id, quantite: 1000, unite: 'g' });

    const c = await computeCoutMatiere(r.id);
    expect(c.coutPartiel).toBe(false);
    // 1 kg × 2 € = 2 € pour le lot → / 2 kg sortie = 1 €/kg
    expect(c.coutMatiereKg).toBe(1);
  });

  it('marque cout_partiel sans prix', async () => {
    const a = await createMatiere({ nom: 'Sans prix', provenance: 'base', uniteAchat: 'kg' });
    const r = await createRecette({
      nom: 'Partiel',
      famille: 'sec',
      type: 'transformation',
      modeQuantite: 'proportions',
    });
    await addIngredient(r.id, { matiereId: a.id, quantite: 1, unite: 'part' });
    const c = await computeCoutMatiere(r.id);
    expect(c.coutPartiel).toBe(true);
  });

  it('somme les temps MO (pas les attentes)', async () => {
    const r = await createRecette({ nom: 'Temps', famille: 'sec', type: 'transformation' });
    await addEtape(r.id, { description: 'A', tempsMainOeuvre: 10, tempsAttente: 100 });
    await addEtape(r.id, { description: 'B', tempsMainOeuvre: 5, tempsAttente: 50 });
    const c = await computeCoutMatiere(r.id);
    expect(c.tempsMoMinutes).toBe(15);
  });
});
