import { requireApiKey, ok, handle } from '@/lib/api';
import { getConflitsLot } from '@/services/lotCulture';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    return ok(await getConflitsLot(Number(params.id)));
  });
}
