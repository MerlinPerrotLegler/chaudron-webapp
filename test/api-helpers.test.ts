import { describe, it, expect } from 'vitest';
import { AppError } from '@/lib/errors';
import { fail, paginated, requireApiKey, handle } from '@/lib/api';

describe('helpers API', () => {
  it('fail renvoie un corps normalisé', async () => {
    const res = fail('not_found', 'absent', 404);
    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toEqual({ code: 'not_found', message: 'absent' });
  });

  it('paginated expose les métadonnées', async () => {
    const res = paginated([1, 2], 5, 1, 2);
    await expect(res.json()).resolves.toEqual({ items: [1, 2], total: 5, page: 1, pageSize: 2 });
  });

  it('requireApiKey lève si la clé est absente', () => {
    const req = new Request('http://x/api/matieres');
    expect(() => requireApiKey(req)).toThrowError(AppError);
  });

  it('requireApiKey accepte la bonne clé', () => {
    const req = new Request('http://x/api/matieres', {
      headers: { 'x-api-key': 'test-key' },
    });
    expect(() => requireApiKey(req)).not.toThrow();
  });

  it('handle convertit AppError en réponse', async () => {
    const res = await handle(async () => {
      throw new AppError('conflict', 'déjà là', 409);
    });
    expect(res.status).toBe(409);
    await expect(res.json()).resolves.toEqual({ code: 'conflict', message: 'déjà là' });
  });
});
