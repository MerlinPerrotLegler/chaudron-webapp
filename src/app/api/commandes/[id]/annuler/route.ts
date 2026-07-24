import { requireApiKey, ok, handle } from '@/lib/api';
import { annulerCommande } from '@/services/commande';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    return ok(await annulerCommande(Number(params.id)));
  });
}
