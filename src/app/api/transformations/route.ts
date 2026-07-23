import { requireApiKey, created, handle } from '@/lib/api';
import { z } from 'zod';
import { declareTransformation } from '@/services/transformation';

const schema = z.object({
  type: z.enum([
    'sechage',
    'distillation',
    'mondage',
    'congelation',
    'torrefaction',
    'autre',
  ]),
  typeLibelle: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  parametres: z.record(z.unknown()).optional(),
  matiereOutId: z.number().int().positive(),
  quantiteOut: z.number().positive(),
  lignesIn: z
    .array(
      z.object({
        matiereId: z.number().int().positive(),
        quantite: z.number().positive(),
        notes: z.string().optional(),
      }),
    )
    .min(1),
  emplacementOutId: z.number().int().positive().optional(),
  datePeremptionOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  operateurNom: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    const body = schema.parse(await req.json());
    return created(await declareTransformation(body));
  });
}
