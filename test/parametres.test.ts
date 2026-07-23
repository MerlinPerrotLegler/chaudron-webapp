import { describe, it, expect, beforeEach } from 'vitest';
import { resetDb } from './db';
import { getParametres, updateParametres } from '@/services/parametres';

beforeEach(resetDb);

describe('parametres', () => {
  it('upsert les défauts puis met à jour', async () => {
    const p = await getParametres();
    expect(p.id).toBe(1);
    expect(p.inclureMo).toBe(true);
    const u = await updateParametres({ tauxHoraireMainOeuvre: 25, inclureMo: false });
    expect(u.tauxHoraireMainOeuvre).toBe(25);
    expect(u.inclureMo).toBe(false);
  });
});
