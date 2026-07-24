import { describe, it, expect, beforeEach } from 'vitest';
import { resetDb } from './db';
import { createEspece } from '@/services/espece';
import { upsertFaisabilite } from '@/services/especeRelations';
import { createParcelle } from '@/services/parcelle';
import { createPlanche } from '@/services/planche';
import { createMatiere } from '@/services/matiere';
import { createRecette } from '@/services/recette';
import { addIngredient } from '@/services/recetteIngredient';
import { createConditionnement } from '@/services/conditionnement';
import { createProduit } from '@/services/produit';
import { upsertIntention } from '@/services/intention';
import {
  genererProposition,
  appliquerProposition,
  couvertureProposition,
} from '@/services/planification';
import { prisma } from '@/lib/prisma';

beforeEach(resetDb);

describe('planification F', () => {
  it('génère proposition avec surfaces et affectation planche', async () => {
    const e = await createEspece({
      nom: 'Thym',
      cycle: 'annuelle',
      rendementKgHaSec: 1000, // 0.1 kg/m²
      besoinEau: 'faible',
    });
    await upsertFaisabilite(e.id, { vocation: 'tunnel', niveau: 'vert' });
    const m = await createMatiere({
      nom: 'Thym séché',
      provenance: 'fermiere',
      uniteAchat: 'kg',
      especeId: e.id,
    });
    const r = await createRecette({
      nom: 'Tisane thym',
      famille: 'tisane',
      type: 'transformation',
      modeQuantite: 'absolu',
      quantiteSortie: 1,
      uniteSortie: 'kg',
    });
    await addIngredient(r.id, { matiereId: m.id, quantite: 1, unite: 'kg' });
    const c = await createConditionnement({ nom: 'Sachet 50g', coutTotal: 0.1 });
    const pf = await createProduit({
      recetteId: r.id,
      conditionnementId: c.id,
      poidsUnite: 0.05,
      prixVenteUnite: 4,
    });
    await upsertIntention({
      produitFiniId: pf.id,
      annee: 2026,
      unitesVisees: 200, // 10 kg produit → 10 kg matière
      priorite: 'P1',
    });

    const parcelle = await createParcelle({ code: 'SA', vocation: 'tunnel' });
    await createPlanche({ parcelleId: parcelle.id, numero: '01', surfaceM2: 200 });

    const prop = await genererProposition({ annee: 2026 });
    expect(prop.statut).toBe('active');
    expect(prop.lignes.length).toBeGreaterThan(0);
    const placee = prop.lignes.find((l) => l.faisabilite === 'vert' && l.plancheId);
    expect(placee).toBeTruthy();
    expect(placee!.surfaceM2).toBeGreaterThan(0);
    // 10 kg / 0.1 kg/m² = 100 m²
    expect(placee!.surfaceM2Calculee).toBeCloseTo(100, 0);
  });

  it('appliquer crée des lots culture', async () => {
    const e = await createEspece({
      nom: 'Romarin',
      rendementKgHaSec: 2000,
    });
    await upsertFaisabilite(e.id, { vocation: 'frais', niveau: 'vert' });
    const m = await createMatiere({
      nom: 'Romarin sec',
      provenance: 'fermiere',
      uniteAchat: 'kg',
      especeId: e.id,
    });
    const r = await createRecette({
      nom: 'Sel romarin',
      famille: 'sel',
      type: 'transformation',
      modeQuantite: 'absolu',
      quantiteSortie: 1,
      uniteSortie: 'kg',
    });
    await addIngredient(r.id, { matiereId: m.id, quantite: 0.5, unite: 'kg' });
    const c = await createConditionnement({ nom: 'Pot', coutTotal: 0.2 });
    const pf = await createProduit({
      recetteId: r.id,
      conditionnementId: c.id,
      poidsUnite: 0.1,
      prixVenteUnite: 5,
    });
    await upsertIntention({
      produitFiniId: pf.id,
      annee: 2026,
      unitesVisees: 20, // 2 kg produit → 1 kg matière
    });
    const parcelle = await createParcelle({ code: 'GA', vocation: 'frais' });
    await createPlanche({ parcelleId: parcelle.id, numero: '01', surfaceM2: 100 });

    const prop = await genererProposition({ annee: 2026 });
    const applied = await appliquerProposition(prop.id, { dateDebut: '2026-03-01' });
    expect(applied.statut).toBe('appliquee');
    expect(applied.lotCultureIds.length).toBeGreaterThan(0);
    const lots = await prisma.lotCulture.count({ where: { especeId: e.id } });
    expect(lots).toBeGreaterThan(0);

    const cov = await couvertureProposition(prop.id);
    expect(cov.length).toBeGreaterThan(0);
  });
});
