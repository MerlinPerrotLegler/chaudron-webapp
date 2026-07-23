import { z } from 'zod';

const familleEnum = z.enum([
  'sec',
  'sirop',
  'sel',
  'sucre',
  'vinaigre',
  'lacto',
  'moutarde',
  'tabasco',
  'tisane',
  'cosmetique',
  'autre',
]);

export const recetteCreateSchema = z.object({
  nom: z.string().min(1),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  famille: familleEnum,
  type: z.enum(['transformation', 'simple']).optional(),
  categorieId: z.number().int().positive().optional(),
  modeQuantite: z.enum(['proportions', 'absolu']).optional(),
  quantiteSortie: z.number().positive().optional(),
  uniteSortie: z.string().optional(),
  lotRefLibelle: z.string().optional(),
  rendementRatioTravail: z.number().positive().optional(),
  notesVariante: z.string().optional(),
});

export type RecetteCreateInput = z.infer<typeof recetteCreateSchema>;

export const recetteUpdateSchema = recetteCreateSchema.partial();
export type RecetteUpdateInput = z.infer<typeof recetteUpdateSchema>;

export const ingredientCreateSchema = z.object({
  matiereId: z.number().int().positive(),
  quantite: z.number().positive(),
  unite: z.string().min(1),
  ordre: z.number().int().nonnegative().optional(),
  poidsEquivG: z.number().positive().optional(),
});

export type IngredientCreateInput = z.infer<typeof ingredientCreateSchema>;
export const ingredientUpdateSchema = ingredientCreateSchema.partial();
export type IngredientUpdateInput = z.infer<typeof ingredientUpdateSchema>;

export const etapeCreateSchema = z.object({
  description: z.string().min(1),
  ordre: z.number().int().nonnegative().optional(),
  tempsMainOeuvre: z.number().int().nonnegative().optional(),
  tempsAttente: z.number().int().nonnegative().optional(),
  parametres: z.record(z.unknown()).optional(),
  equipementIds: z.array(z.number().int().positive()).optional(),
});

export type EtapeCreateInput = z.infer<typeof etapeCreateSchema>;
export const etapeUpdateSchema = etapeCreateSchema.partial();
export type EtapeUpdateInput = z.infer<typeof etapeUpdateSchema>;
