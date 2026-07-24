import { describe, it, expect, beforeEach } from 'vitest';
import { resetDb } from './db';
import { createMatiere } from '@/services/matiere';
import { createClient } from '@/services/client';
import { getSettingsBundle, updateApparence, updateIdentite } from '@/services/settings';
import { searchGlobal } from '@/services/search';
import { getDashboard } from '@/services/dashboard';

beforeEach(resetDb);

describe('settings + transverses', () => {
  it('AppSettings defaults + update apparence/identité', async () => {
    const s = await getSettingsBundle();
    expect(s.apparence.appName).toContain('Chaudron');
    expect(s.apparence.colorPrimary).toBe('#3F5D4A');

    await updateApparence({ colorPrimary: '#2A4A3A' });
    await updateIdentite({ appName: 'Chaudron Test' });
    const s2 = await getSettingsBundle();
    expect(s2.apparence.colorPrimary).toBe('#2A4A3A');
    expect(s2.apparence.appName).toBe('Chaudron Test');
  });

  it('recherche globale groupe les résultats', async () => {
    await createMatiere({ nom: 'Thym citron', provenance: 'importation', uniteAchat: 'kg' });
    await createClient({ nom: 'Client Thym' });
    const r = await searchGlobal('Thym');
    expect(r.matieres.some((m) => m.nom.includes('Thym'))).toBe(true);
    expect(r.clients.some((c) => c.nom.includes('Thym'))).toBe(true);
  });

  it('dashboard renvoie les widgets V1', async () => {
    const d = await getDashboard();
    expect(d).toHaveProperty('alertesStock');
    expect(d).toHaveProperty('productionsEnCours');
    expect(d).toHaveProperty('etapesCultureAVenir');
    expect(d).toHaveProperty('livraisonsAVenir');
    expect(d).toHaveProperty('commandesAPreparer');
  });
});
