import { describe, it, expect, beforeEach, vi } from 'vitest';
import { resetDb } from './db';
import * as webhooks from '@/lib/webhooks';
import { createMatiere } from '@/services/matiere';

beforeEach(resetDb);

describe('émission de webhook', () => {
  it('émet matiere.creee à la création', async () => {
    const spy = vi.spyOn(webhooks, 'emit').mockResolvedValue();
    await createMatiere({ nom: 'Sel', provenance: 'base', uniteAchat: 'kg' });
    expect(spy).toHaveBeenCalledWith('matiere.creee', expect.objectContaining({ nom: 'Sel' }));
    spy.mockRestore();
  });
});
