import { requireApiKey, ok, handle } from '@/lib/api';
import { parametresUpdateSchema } from '@/lib/validation/parametres';
import { getParametres, updateParametres } from '@/services/parametres';

export async function GET(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    return ok(await getParametres());
  });
}

export async function PUT(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    const body = parametresUpdateSchema.parse(await req.json());
    return ok(await updateParametres(body));
  });
}
