import { requireApiKey, ok, handle } from '@/lib/api';
import { apparenceUpdateSchema } from '@/lib/validation/settings';
import { updateApparence } from '@/services/settings';

export async function PUT(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    const body = apparenceUpdateSchema.parse(await req.json());
    return ok(await updateApparence(body));
  });
}
