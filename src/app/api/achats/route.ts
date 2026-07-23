import { requireApiKey, created, handle } from '@/lib/api';
import { achatCreateSchema } from '@/lib/validation/stock';
import { declareAchat } from '@/services/stock';

export async function POST(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    const body = achatCreateSchema.parse(await req.json());
    return created(await declareAchat(body));
  });
}
