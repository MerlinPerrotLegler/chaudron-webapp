import { requireApiKey, ok, handle } from '@/lib/api';
import { z } from 'zod';
import { reappliquerItineraire } from '@/services/lotCulture';

const bodySchema = z.object({
  dateDebut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    const json = await req.json().catch(() => ({}));
    const body = bodySchema.parse(json);
    return ok(await reappliquerItineraire(Number(params.id), body.dateDebut));
  });
}
