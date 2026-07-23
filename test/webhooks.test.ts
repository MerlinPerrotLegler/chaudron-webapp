import { describe, it, expect } from 'vitest';
import { resolveHooks } from '@/lib/webhooks';

describe('resolveHooks', () => {
  it("renvoie les urls d'un événement", () => {
    const cfg = { 'matiere.creee': ['https://a', 'https://b'] };
    expect(resolveHooks(cfg, 'matiere.creee')).toEqual(['https://a', 'https://b']);
  });

  it('renvoie [] pour un événement inconnu', () => {
    expect(resolveHooks({}, 'x.y')).toEqual([]);
  });
});
