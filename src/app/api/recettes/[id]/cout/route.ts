import { requireApiKey, ok, handle } from '@/lib/api';
import { computeCoutMatiere } from '@/services/recetteCout';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    return ok(await computeCoutMatiere(Number(params.id)));
  });
}
