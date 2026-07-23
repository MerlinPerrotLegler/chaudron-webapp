import { z } from 'zod';

export const prixCreateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  prix: z.number().nonnegative(),
});

export type PrixCreateInput = z.infer<typeof prixCreateSchema>;
