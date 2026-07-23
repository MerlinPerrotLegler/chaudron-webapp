import { z } from 'zod';

export const especeCreateSchema = z.object({
  nom: z.string().min(1),
  nomLatin: z.string().optional(),
  famille: z.string().optional(),
  cycle: z.enum(['annuelle', 'bisannuelle', 'vivace']).optional(),
  renouvellementAns: z.number().int().positive().optional(),
  phMin: z.number().optional(),
  phMax: z.number().optional(),
  typeSol: z.string().optional(),
  exposition: z.string().optional(),
  tempsLeveeMin: z.number().int().nonnegative().optional(),
  tempsLeveeMax: z.number().int().nonnegative().optional(),
  tempsAvantRepiquage: z.number().int().nonnegative().optional(),
  besoinEau: z.enum(['faible', 'modere', 'eleve']).optional(),
  besoinEauLJour: z.number().nonnegative().optional(),
  besoinEauLMois: z.number().nonnegative().optional(),
  espacementCm: z.number().positive().optional(),
  densitePlantsHa: z.number().positive().optional(),
  rendementTHaFrais: z.number().nonnegative().optional(),
  rendementKgHaSec: z.number().nonnegative().optional(),
  amendementNotes: z.string().optional(),
});

export type EspeceCreateInput = z.infer<typeof especeCreateSchema>;
export const especeUpdateSchema = especeCreateSchema.partial();
export type EspeceUpdateInput = z.infer<typeof especeUpdateSchema>;

const mmdd = z.string().regex(/^\d{2}-\d{2}$/).optional();

export const itineraireEtapeSchema = z.object({
  ordre: z.number().int().nonnegative().optional(),
  code: z.enum(['semis', 'plantation', 'recolte', 'taille', 'division', 'autre']),
  libelle: z.string().optional(),
  dureeDepuisPrecedenteJours: z.number().int().nonnegative().optional(),
  fenetreDebutMmdd: mmdd,
  fenetreFinMmdd: mmdd,
  description: z.string().optional(),
});

export type ItineraireEtapeInput = z.infer<typeof itineraireEtapeSchema>;

export const associationSchema = z.object({
  especeCibleId: z.number().int().positive(),
  type: z.enum(['favorable', 'deconseillee']),
  notes: z.string().optional(),
});

export const risqueSchema = z.object({
  nom: z.string().min(1),
  description: z.string().optional(),
  prevention: z.string().optional(),
});

export const faisabiliteSchema = z.object({
  vocation: z.enum([
    'serre_semis',
    'tunnel',
    'frais',
    'maraichage',
    'draine_ensoleille',
    'grande_culture',
    'autre',
  ]),
  niveau: z.enum(['vert', 'jaune', 'rouge']),
  notes: z.string().optional(),
});
