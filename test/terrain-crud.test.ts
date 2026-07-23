import { describe, it, expect, beforeEach } from 'vitest';
import { resetDb } from './db';
import {
  createParcelle,
  updateParcelle,
  archiveParcelle,
  listParcelles,
} from '@/services/parcelle';
import { createPlanche, listPlanches, getPlanche } from '@/services/planche';

beforeEach(resetDb);

describe('parcelles & planches', () => {
  it('crée parcelle SA et planche SA-01', async () => {
    const sa = await createParcelle({ code: 'SA', vocation: 'tunnel' });
    const pl = await createPlanche({
      parcelleId: sa.id,
      numero: '01',
      surfaceM2: 12,
    });
    expect(pl.code).toBe('SA-01');
    expect((await listPlanches({ parcelleId: sa.id })).total).toBe(1);
    expect((await getPlanche(pl.id)).surfaceM2).toBe(12);
  });

  it('refuse code parcelle invalide via zod côté route — service accepte code validé', async () => {
    await expect(
      createParcelle({ code: 'SA', vocation: 'tunnel' }),
    ).resolves.toMatchObject({ code: 'SA' });
    await expect(
      createParcelle({ code: 'SA', vocation: 'tunnel' }),
    ).rejects.toMatchObject({ code: 'conflict', status: 409 });
  });

  it('recalcule codes planches si renommage parcelle', async () => {
    const p = await createParcelle({ code: 'SA', vocation: 'tunnel' });
    await createPlanche({ parcelleId: p.id, numero: '01', surfaceM2: 10 });
    await createPlanche({ parcelleId: p.id, numero: '02', surfaceM2: 10 });
    await updateParcelle(p.id, { code: 'SB' });
    const codes = (await listPlanches({ parcelleId: p.id })).items.map((x) => x.code);
    expect(codes.sort()).toEqual(['SB-01', 'SB-02']);
  });

  it('refuse d’archiver parcelle avec planches actives', async () => {
    const p = await createParcelle({ code: 'GA', vocation: 'frais' });
    await createPlanche({ parcelleId: p.id, numero: '01', surfaceM2: 20 });
    await expect(archiveParcelle(p.id)).rejects.toMatchObject({ code: 'conflict', status: 409 });
    expect((await listParcelles({})).total).toBe(1);
  });
});
