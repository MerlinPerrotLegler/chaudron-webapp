import { requireApiKey, ok, handle } from '@/lib/api';
import { confirmerCommande } from '@/services/commande';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    return ok(await confirmerCommande(Number(params.id)));
  });
}
