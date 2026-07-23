import { z } from 'zod';

export const parametresUpdateSchema = z.object({
  tauxHoraireMainOeuvre: z.number().nonnegative().optional(),
  inclureMo: z.boolean().optional(),
});

export type ParametresUpdateInput = z.infer<typeof parametresUpdateSchema>;
