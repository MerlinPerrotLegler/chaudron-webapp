import { z } from 'zod';

export const vocationEnum = z.enum([
  'serre_semis',
  'tunnel',
  'frais',
  'maraichage',
  'draine_ensoleille',
  'grande_culture',
  'autre',
]);

export const parcelleCreateSchema = z.object({
  code: z.string().regex(/^[A-Z]+$/, 'code parcelle : lettres majuscules uniquement'),
  vocation: vocationEnum,
  typeSol: z.string().optional(),
  ph: z.number().optional(),
  drainage: z.string().optional(),
  pierrosite: z.string().optional(),
  exposition: z.string().optional(),
  pente: z.string().optional(),
  particularites: z.string().optional(),
  surfaceM2: z.number().positive().optional(),
});

export type ParcelleCreateInput = z.infer<typeof parcelleCreateSchema>;
export const parcelleUpdateSchema = parcelleCreateSchema.partial();
export type ParcelleUpdateInput = z.infer<typeof parcelleUpdateSchema>;

export const plancheCreateSchema = z.object({
  parcelleId: z.number().int().positive(),
  numero: z.string().regex(/^[0-9]{2,3}$/, 'numéro planche : 2 ou 3 chiffres'),
  surfaceM2: z.number().positive(),
  particularites: z.string().optional(),
});

export type PlancheCreateInput = z.infer<typeof plancheCreateSchema>;
export const plancheUpdateSchema = z.object({
  numero: z.string().regex(/^[0-9]{2,3}$/).optional(),
  surfaceM2: z.number().positive().optional(),
  particularites: z.string().optional(),
});
export type PlancheUpdateInput = z.infer<typeof plancheUpdateSchema>;
