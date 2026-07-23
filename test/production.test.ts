import { describe, it, expect, beforeEach } from 'vitest';
import { resetDb } from './db';
import { createMatiere } from '@/services/matiere';
import { declareAchat, soldeMatiere, soldeProduit } from '@/services/stock';
import { declareTransformation } from '@/services/transformation';
import { createRecette } from '@/services/recette';
import { addIngredient } from '@/services/recetteIngredient';
import { createConditionnement } from '@/services/conditionnement';
import { createProduit } from '@/services/produit';
import { createProduction, terminerProduction } from '@/services/production';

beforeEach(resetDb);

describe('production & transformation', () => {
  it('séchage : sort frais, entre sec, calcule rendement', async () => {
    const frais = await createMatiere({
      nom: 'Thym frais',
      provenance: 'importation',
      uniteAchat: 'kg',
    });
    const sec = await createMatiere({
      nom: 'Thym séché',
      provenance: 'importation',
      uniteAchat: 'kg',
    });
    await declareAchat({
      matiereId: frais.id,
      date: '2026-06-01',
      quantite: 10,
      prixUnitaire: 5,
      ajouterPrixCatalogue: false,
    });

    const t = await declareTransformation({
      type: 'sechage',
      date: '2026-06-02',
      matiereOutId: sec.id,
      quantiteOut: 2.5,
      lignesIn: [{ matiereId: frais.id, quantite: 10 }],
      notes: 'Séchoir A',
    });

    expect(t.rendement).toBeCloseTo(0.25);
    expect(await soldeMatiere(frais.id)).toBe(0);
    expect(await soldeMatiere(sec.id)).toBe(2.5);
  });

  it('production : crée puis termine → stock matières/produit', async () => {
    const m = await createMatiere({ nom: 'Sel', provenance: 'base', uniteAchat: 'kg' });
    await declareAchat({
      matiereId: m.id,
      date: '2026-01-01',
      quantite: 5,
      prixUnitaire: 1,
      ajouterPrixCatalogue: false,
    });
    const r = await createRecette({
      nom: 'Sel aromatisé',
      famille: 'sel',
      type: 'transformation',
      modeQuantite: 'absolu',
      quantiteSortie: 1,
      uniteSortie: 'kg',
    });
    await addIngredient(r.id, { matiereId: m.id, quantite: 1, unite: 'kg' });
    const c = await createConditionnement({ nom: 'Pot 100g', coutTotal: 0.2 });
    const pf = await createProduit({
      recetteId: r.id,
      conditionnementId: c.id,
      poidsUnite: 0.1,
      prixVenteUnite: 3,
    });

    const prod = await createProduction({
      recetteId: r.id,
      date: '2026-02-01',
      numeroLot: '2026-02-01-001',
      quantiteSortieVisee: 1,
      sorties: [{ produitFiniId: pf.id, quantiteUnites: 10 }],
    });
    expect(prod.statut).toBe('en_cours');
    expect(prod.lignesMatiere[0].quantiteRequise).toBe(1);

    await terminerProduction(prod.id);
    expect(await soldeMatiere(m.id)).toBe(4);
    expect(await soldeProduit(pf.id)).toBe(10);
  });
});
