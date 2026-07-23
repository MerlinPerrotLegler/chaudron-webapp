import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';
import { resetDb } from './db';

beforeEach(resetDb);

describe('schéma Matiere', () => {
  it('crée et relit une matière', async () => {
    const m = await prisma.matiere.create({
      data: { nom: 'Thym', provenance: 'fermiere', uniteAchat: 'kg' },
    });
    expect(m.id).toBeGreaterThan(0);
    expect(m.archivee).toBe(false);
  });
});
