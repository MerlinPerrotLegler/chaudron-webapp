import { requireApiKey, ok, handle } from '@/lib/api';
import { terminerProduction } from '@/services/production';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    return ok(await terminerProduction(Number(params.id)));
  });
}
