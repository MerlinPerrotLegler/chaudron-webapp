import { z } from 'zod';

export const typeClientEnum = z.enum([
  'particulier',
  'professionnel',
  'association',
  'autre',
]);

export const clientCreateSchema = z.object({
  nom: z.string().min(1),
  type: typeClientEnum.optional(),
  contactNom: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  telephone: z.string().optional(),
  adresse: z.string().optional(),
  codePostal: z.string().optional(),
  ville: z.string().optional(),
  conditionsLivraison: z.string().optional(),
  notes: z.string().optional(),
});
export type ClientCreateInput = z.infer<typeof clientCreateSchema>;
export const clientUpdateSchema = clientCreateSchema.partial();

export const clientNoteSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  texte: z.string().min(1),
  operateurNom: z.string().optional(),
});

export const typePointVenteEnum = z.enum([
  'ferme',
  'marche',
  'boutique_producteur',
  'demi_gros',
  'tournee',
  'autre',
]);

export const pointVenteCreateSchema = z.object({
  nom: z.string().min(1),
  type: typePointVenteEnum,
  contact: z.string().optional(),
  joursLivraisonHabituels: z.array(z.number().int().min(0).max(6)).optional(),
  notes: z.string().optional(),
});
export const pointVenteUpdateSchema = pointVenteCreateSchema.partial();

export const dateLivraisonSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().optional(),
});

export const intentionSchema = z.object({
  produitFiniId: z.number().int().positive(),
  annee: z.number().int().min(2000).max(2100),
  unitesVisees: z.number().positive(),
  priorite: z.enum(['P1', 'P2', 'P3']).optional(),
  notes: z.string().optional(),
});

export const commandeLigneSchema = z.object({
  produitFiniId: z.number().int().positive(),
  quantite: z.number().positive(),
  prixUnitaire: z.number().nonnegative().optional(),
  notes: z.string().optional(),
});

export const commandeCreateSchema = z.object({
  clientId: z.number().int().positive(),
  pointVenteId: z.number().int().positive(),
  dateCommande: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dateLivraison: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reference: z.string().optional(),
  notes: z.string().optional(),
  operateurNom: z.string().optional(),
  lignes: z.array(commandeLigneSchema).min(1),
});

export const commandeUpdateSchema = z.object({
  dateLivraison: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  reference: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const livrerSchema = z.object({
  dateLivraisonReelle: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  operateurNom: z.string().optional(),
});

export const venteDirecteSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  produitFiniId: z.number().int().positive(),
  pointVenteId: z.number().int().positive(),
  clientId: z.number().int().positive().optional(),
  quantite: z.number().positive(),
  prixUnitaire: z.number().nonnegative().optional(),
  notes: z.string().optional(),
  operateurNom: z.string().optional(),
});
