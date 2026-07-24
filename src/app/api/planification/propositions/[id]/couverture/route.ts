import { requireApiKey, ok, handle } from '@/lib/api';
import { couvertureProposition } from '@/services/planification';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    return ok(await couvertureProposition(Number(params.id)));
  });
}
