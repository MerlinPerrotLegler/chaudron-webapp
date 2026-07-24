import { requireApiKey, ok, handle } from '@/lib/api';
import { annulerVente } from '@/services/vente';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    return ok(await annulerVente(Number(params.id)));
  });
}
