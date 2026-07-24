import { requireApiKey, ok, handle } from '@/lib/api';
import { commandeUpdateSchema } from '@/lib/validation/commercial';
import { getCommande, updateCommande } from '@/services/commande';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    return ok(await getCommande(Number(params.id)));
  });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    const body = commandeUpdateSchema.parse(await req.json());
    return ok(await updateCommande(Number(params.id), body));
  });
}
