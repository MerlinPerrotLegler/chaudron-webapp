import { z } from 'zod';

export const matiereCreateSchema = z.object({
  nom: z.string().min(1),
  nomLatin: z.string().optional(),
  provenance: z.enum(['fermiere', 'importation', 'base']),
  uniteAchat: z.enum(['kg', 'L', 'piece']).optional(),
  ratioSechage: z.number().positive().optional(),
  pctEau: z.number().min(0).max(100).optional(),
  besoinEau: z.enum(['faible', 'modere', 'eleve']).optional(),
  source: z.string().optional(),
  fournisseur: z.string().optional(),
  lien: z.string().url().optional(),
  prixVenteKg: z.number().nonnegative().optional(),
  especeId: z.number().int().positive().optional(),
});

export type MatiereCreateInput = z.infer<typeof matiereCreateSchema>;

export const matiereUpdateSchema = matiereCreateSchema.partial();
export type MatiereUpdateInput = z.infer<typeof matiereUpdateSchema>;
