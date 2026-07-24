import { requireApiKey, ok, handle } from '@/lib/api';
import { livrerSchema } from '@/lib/validation/commercial';
import { livrerCommande } from '@/services/commande';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    const raw = await req.text();
    const body = raw ? livrerSchema.parse(JSON.parse(raw)) : {};
    return ok(await livrerCommande(Number(params.id), body));
  });
}
