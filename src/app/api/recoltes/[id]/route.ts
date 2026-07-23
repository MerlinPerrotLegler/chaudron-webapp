import { requireApiKey, ok, handle } from '@/lib/api';
import { getRecolte } from '@/services/recolte';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    return ok(await getRecolte(Number(params.id)));
  });
}
