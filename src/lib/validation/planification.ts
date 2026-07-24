import { z } from 'zod';

export const propositionCreateSchema = z.object({
  annee: z.number().int().min(2000).max(2100),
  inclureCommandes: z.boolean().optional(),
  parametres: z
    .object({
      ignorerStock: z.boolean().optional(),
      filtreEau: z.string().optional(),
    })
    .optional(),
  notes: z.string().optional(),
});

export const lignePatchSchema = z.object({
  surfaceM2: z.number().positive().optional(),
  plancheId: z.number().int().positive().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const appliquerSchema = z.object({
  dateDebut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const recalculerSchema = z.object({
  forcerManuelles: z.boolean().optional(),
});
