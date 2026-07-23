import { z } from 'zod';

export const emplacementCreateSchema = z.object({
  nom: z.string().min(1),
  notes: z.string().optional(),
});

export const achatCreateSchema = z.object({
  matiereId: z.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  quantite: z.number().positive(),
  prixUnitaire: z.number().nonnegative(),
  fournisseur: z.string().optional(),
  emplacementId: z.number().int().positive().optional(),
  datePeremption: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  ajouterPrixCatalogue: z.boolean().optional(),
  operateurNom: z.string().optional(),
});

export const sortieMatiereSchema = z.object({
  matiereId: z.number().int().positive(),
  quantite: z.number().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  lotIds: z.array(z.number().int().positive()).optional(),
  refType: z.string().optional(),
  refId: z.number().int().optional(),
  operateurNom: z.string().optional(),
});
