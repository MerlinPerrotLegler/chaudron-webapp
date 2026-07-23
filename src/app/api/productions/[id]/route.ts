import { requireApiKey, ok, handle } from '@/lib/api';
import { getProduction, terminerProduction } from '@/services/production';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    return ok(await getProduction(Number(params.id)));
  });
}
