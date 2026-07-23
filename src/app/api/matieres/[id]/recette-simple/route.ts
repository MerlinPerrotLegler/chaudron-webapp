import { requireApiKey, created, handle } from '@/lib/api';
import { z } from 'zod';
import { creerRecetteSimple } from '@/services/recetteSimple';

const bodySchema = z
  .object({
    nom: z.string().min(1).optional(),
    famille: z.enum(['sec', 'autre']).optional(),
  })
  .optional();

export async function POST(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    const json = await req.json().catch(() => ({}));
    const body = bodySchema.parse(json) ?? {};
    return created(await creerRecetteSimple(Number(params.id), body));
  });
}
