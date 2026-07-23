import { z } from 'zod';

export const conditionnementCreateSchema = z.object({
  nom: z.string().min(1),
  contenance: z.number().positive().optional(),
  poidsNet: z.number().positive().optional(),
  coutContenant: z.number().nonnegative().optional(),
  coutBouchon: z.number().nonnegative().optional(),
  coutEtiquette: z.number().nonnegative().optional(),
  coutTotal: z.number().nonnegative().optional(),
  lienContenant: z.string().optional(),
  lienBouchon: z.string().optional(),
});

export type ConditionnementCreateInput = z.infer<typeof conditionnementCreateSchema>;
export const conditionnementUpdateSchema = conditionnementCreateSchema.partial();
export type ConditionnementUpdateInput = z.infer<typeof conditionnementUpdateSchema>;
