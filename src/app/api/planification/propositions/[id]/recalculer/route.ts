import { requireApiKey, ok, handle } from '@/lib/api';
import { recalculerSchema } from '@/lib/validation/planification';
import { recalculerProposition } from '@/services/planification';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    const raw = await req.text();
    const body = raw ? recalculerSchema.parse(JSON.parse(raw)) : {};
    return ok(await recalculerProposition(Number(params.id), body));
  });
}
