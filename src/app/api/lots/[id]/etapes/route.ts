import { requireApiKey, ok, handle } from '@/lib/api';
import { getLot } from '@/services/lotCulture';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    const lot = await getLot(Number(params.id));
    return ok(lot.etapes);
  });
}
