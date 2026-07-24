import { requireApiKey, ok, handle } from '@/lib/api';
import { identiteUpdateSchema } from '@/lib/validation/settings';
import { updateIdentite } from '@/services/settings';

export async function PUT(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    const body = identiteUpdateSchema.parse(await req.json());
    return ok(await updateIdentite(body));
  });
}
