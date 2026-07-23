import { requireApiKey, created, ok, handle } from '@/lib/api';
import { z } from 'zod';
import { createProduction, terminerProduction, getProduction } from '@/services/production';

const createSchema = z.object({
  recetteId: z.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  numeroLot: z.string().min(1),
  facteurEchelle: z.number().positive().optional(),
  quantiteSortieVisee: z.number().positive().optional(),
  sorties: z
    .array(
      z.object({
        produitFiniId: z.number().int().positive(),
        quantiteUnites: z.number().positive(),
        poidsKg: z.number().positive().optional(),
        emplacementId: z.number().int().positive().optional(),
        datePeremption: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      }),
    )
    .min(1),
  operateurNom: z.string().optional(),
  notes: z.string().optional(),
  poidsKg: z.number().positive().optional(),
});

export async function POST(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    const body = createSchema.parse(await req.json());
    return created(await createProduction(body));
  });
}
