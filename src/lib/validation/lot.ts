import { z } from 'zod';

export const lotCreateSchema = z.object({
  especeId: z.number().int().positive(),
  plancheId: z.number().int().positive(),
  annee: z.number().int().min(2000).max(2100),
  surfaceM2: z.number().positive(),
  priorite: z.enum(['P1', 'P2', 'P3']).optional(),
  notes: z.string().optional(),
  /** Date d’ancrage de la 1ʳᵉ étape (cascade avant). YYYY-MM-DD */
  dateDebut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export type LotCreateInput = z.infer<typeof lotCreateSchema>;

export const lotUpdateSchema = z.object({
  surfaceM2: z.number().positive().optional(),
  priorite: z.enum(['P1', 'P2', 'P3']).optional(),
  notes: z.string().optional(),
  etat: z
    .enum(['prevu', 'seme', 'plante', 'en_croissance', 'en_recolte', 'termine', 'abandonne'])
    .optional(),
  rendementTHaFraisReel: z.number().optional(),
  rendementKgHaSecReel: z.number().optional(),
});

export type LotUpdateInput = z.infer<typeof lotUpdateSchema>;

export const lotEtapePatchSchema = z.object({
  datePrevue: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  verrouillee: z.boolean().optional(),
  decouplee: z.boolean().optional(),
  dateReelle: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  fait: z.boolean().optional(),
  dureeDepuisPrecedenteJours: z.number().int().nonnegative().optional(),
});

export type LotEtapePatchInput = z.infer<typeof lotEtapePatchSchema>;

export const recolteCreateSchema = z.object({
  lotId: z.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  poidsKg: z.number().positive(),
  matiereId: z.number().int().positive(),
  qualite: z.enum(['A', 'B', 'C', 'autre']).optional(),
  qualiteNotes: z.string().optional(),
  numerosSacs: z.array(z.string()).optional(),
  emplacement: z.string().optional(),
  datePeremption: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  campagneId: z.string().uuid().optional(),
  notes: z.string().optional(),
  operateurNom: z.string().optional(),
});

export type RecolteCreateInput = z.infer<typeof recolteCreateSchema>;
