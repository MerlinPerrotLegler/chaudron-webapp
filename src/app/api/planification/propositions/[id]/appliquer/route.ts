import { requireApiKey, ok, handle } from '@/lib/api';
import { appliquerSchema } from '@/lib/validation/planification';
import { appliquerProposition } from '@/services/planification';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    const raw = await req.text();
    const body = raw ? appliquerSchema.parse(JSON.parse(raw)) : {};
    return ok(await appliquerProposition(Number(params.id), body));
  });
}
