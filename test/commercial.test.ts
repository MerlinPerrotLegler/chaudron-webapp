import { describe, it, expect, beforeEach } from 'vitest';
import { resetDb } from './db';
import { createMatiere } from '@/services/matiere';
import { createRecette } from '@/services/recette';
import { addIngredient } from '@/services/recetteIngredient';
import { createConditionnement } from '@/services/conditionnement';
import { createProduit } from '@/services/produit';
import { createProduction, terminerProduction } from '@/services/production';
import { declareAchat, soldeProduit } from '@/services/stock';
import {
  createClient,
  archiveClient,
  addClientNote,
  getClientHistorique,
} from '@/services/client';
import {
  createPointVente,
  addDateLivraison,
  listDatesLivraison,
} from '@/services/pointVente';
import { upsertIntention, listIntentions, realiseVsIntention } from '@/services/intention';
import {
  createCommande,
  confirmerCommande,
  preparerCommande,
  livrerCommande,
  annulerCommande,
} from '@/services/commande';
import { declareVenteDirecte, annulerVente, listBesoins } from '@/services/vente';

beforeEach(resetDb);

async function seedProduitEnStock(unites = 20) {
  const m = await createMatiere({ nom: 'Sel', provenance: 'base', uniteAchat: 'kg' });
  await declareAchat({
    matiereId: m.id,
    date: '2026-01-01',
    quantite: 50,
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
  await addIngredient(r.id, { matiereId: m.id, quantite: 0.1, unite: 'kg' });
  const c = await createConditionnement({ nom: 'Pot 100g', coutTotal: 0.2 });
  const pf = await createProduit({
    recetteId: r.id,
    conditionnementId: c.id,
    poidsUnite: 0.1,
    prixVenteUnite: 5,
  });
  const prod = await createProduction({
    recetteId: r.id,
    date: '2026-02-01',
    numeroLot: `LOT-${pf.id}-${unites}`,
    quantiteSortieVisee: unites * 0.1,
    sorties: [{ produitFiniId: pf.id, quantiteUnites: unites }],
  });
  await terminerProduction(prod.id);
  return { pf, matiere: m };
}

describe('commercial B', () => {
  it('clients + notes + historique', async () => {
    const client = await createClient({
      nom: 'Boutique Verte',
      type: 'professionnel',
      email: 'contact@bv.fr',
    });
    await addClientNote(client.id, {
      date: '2026-03-01',
      texte: 'Appel suivi',
      operateurNom: 'Alice',
    });
    const histo = await getClientHistorique(client.id);
    expect(histo.some((e) => e.type === 'note')).toBe(true);
  });

  it('refuse archive client avec commande active', async () => {
    const { pf } = await seedProduitEnStock(5);
    const client = await createClient({ nom: 'Client Actif' });
    const pdv = await createPointVente({ nom: 'Dépôt A', type: 'demi_gros' });
    await createCommande({
      clientId: client.id,
      pointVenteId: pdv.id,
      dateCommande: '2026-04-01',
      dateLivraison: '2026-04-10',
      lignes: [{ produitFiniId: pf.id, quantite: 2 }],
    });
    await expect(archiveClient(client.id)).rejects.toMatchObject({
      code: 'conflict',
      status: 409,
    });
  });

  it('points de vente + dates livraison', async () => {
    const pdv = await createPointVente({
      nom: 'Marché samedi',
      type: 'marche',
      joursLivraisonHabituels: [6],
    });
    await addDateLivraison(pdv.id, { date: '2026-05-03', notes: 'Stand 12' });
    const dates = await listDatesLivraison(pdv.id);
    expect(dates).toHaveLength(1);
  });

  it('intentions + réalisé vs intention', async () => {
    const { pf } = await seedProduitEnStock(30);
    await upsertIntention({
      produitFiniId: pf.id,
      annee: 2026,
      unitesVisees: 100,
      priorite: 'P1',
    });
    const pdv = await createPointVente({ nom: 'Ferme', type: 'ferme' });
    await declareVenteDirecte({
      date: '2026-06-01',
      produitFiniId: pf.id,
      pointVenteId: pdv.id,
      quantite: 10,
    });
    const synth = await realiseVsIntention(2026);
    const row = synth.find((r) => r.produitFiniId === pf.id);
    expect(row?.unitesVisees).toBe(100);
    expect(row?.unitesRealisees).toBe(10);
    expect(await soldeProduit(pf.id)).toBe(20);
  });

  it('cycle commande : confirmer → préparer → livrer déstocke', async () => {
    const { pf } = await seedProduitEnStock(15);
    const client = await createClient({ nom: 'Épicerie du coin' });
    const pdv = await createPointVente({ nom: 'Tournée Est', type: 'tournee' });
    const cmd = await createCommande({
      clientId: client.id,
      pointVenteId: pdv.id,
      dateCommande: '2026-07-01',
      dateLivraison: '2026-07-15',
      lignes: [{ produitFiniId: pf.id, quantite: 5, prixUnitaire: 4.5 }],
    });
    expect(cmd.statut).toBe('brouillon');
    expect(cmd.lignes[0].montant).toBeCloseTo(22.5);

    await confirmerCommande(cmd.id);
    await preparerCommande(cmd.id);
    const livree = await livrerCommande(cmd.id);
    expect(livree.statut).toBe('livree');
    expect(await soldeProduit(pf.id)).toBe(10);

    const histo = await getClientHistorique(client.id);
    expect(histo.some((e) => e.type === 'vente')).toBe(true);
    expect(histo.some((e) => e.type === 'commande')).toBe(true);

    await expect(livrerCommande(cmd.id)).rejects.toMatchObject({ status: 409 });
  });

  it('livraison refuse stock insuffisant (409)', async () => {
    const { pf } = await seedProduitEnStock(3);
    const client = await createClient({ nom: 'Gros' });
    const pdv = await createPointVente({ nom: 'Demi-gros', type: 'demi_gros' });
    const cmd = await createCommande({
      clientId: client.id,
      pointVenteId: pdv.id,
      dateCommande: '2026-08-01',
      dateLivraison: '2026-08-05',
      lignes: [{ produitFiniId: pf.id, quantite: 10 }],
    });
    await confirmerCommande(cmd.id);
    await preparerCommande(cmd.id);
    await expect(livrerCommande(cmd.id)).rejects.toMatchObject({
      code: 'STOCK_INSUFFISANT',
      status: 409,
    });
    expect(await soldeProduit(pf.id)).toBe(3);
  });

  it('annuler commande non livrée ; annuler vente restock', async () => {
    const { pf } = await seedProduitEnStock(10);
    const client = await createClient({ nom: 'Annul' });
    const pdv = await createPointVente({ nom: 'Boutique', type: 'boutique_producteur' });
    const cmd = await createCommande({
      clientId: client.id,
      pointVenteId: pdv.id,
      dateCommande: '2026-09-01',
      dateLivraison: '2026-09-10',
      lignes: [{ produitFiniId: pf.id, quantite: 2 }],
    });
    await confirmerCommande(cmd.id);
    await annulerCommande(cmd.id);

    const vente = await declareVenteDirecte({
      date: '2026-09-02',
      produitFiniId: pf.id,
      pointVenteId: pdv.id,
      clientId: client.id,
      quantite: 3,
    });
    expect(await soldeProduit(pf.id)).toBe(7);
    await annulerVente(vente.id);
    expect(await soldeProduit(pf.id)).toBe(10);
  });

  it('besoins dérivés des intentions', async () => {
    const { pf, matiere } = await seedProduitEnStock(5);
    await upsertIntention({
      produitFiniId: pf.id,
      annee: 2026,
      unitesVisees: 50,
    });
    const besoins = await listBesoins({ annee: 2026 });
    const row = besoins.find((b) => b.matiereId === matiere.id);
    // 50 unités × 0.1 kg / unité (via recette absolue × poids) — approx via facteur
    expect(row?.quantite).toBeGreaterThan(0);
    expect(listIntentions).toBeDefined();
  });
});
