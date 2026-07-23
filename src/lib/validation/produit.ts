import { z } from 'zod';

export const produitCreateSchema = z.object({
  recetteId: z.number().int().positive(),
  conditionnementId: z.number().int().positive(),
  poidsUnite: z.number().positive(),
  prixVenteUnite: z.number().nonnegative().optional(),
  actif: z.boolean().optional(),
});

export type ProduitCreateInput = z.infer<typeof produitCreateSchema>;

export const produitUpdateSchema = z.object({
  conditionnementId: z.number().int().positive().optional(),
  poidsUnite: z.number().positive().optional(),
  prixVenteUnite: z.number().nonnegative().nullable().optional(),
  actif: z.boolean().optional(),
});

export type ProduitUpdateInput = z.infer<typeof produitUpdateSchema>;
