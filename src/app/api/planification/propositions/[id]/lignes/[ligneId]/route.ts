import { requireApiKey, ok, handle } from '@/lib/api';
import { lignePatchSchema } from '@/lib/validation/planification';
import { patchLigne } from '@/services/planification';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string; ligneId: string } },
) {
  return handle(async () => {
    requireApiKey(req);
    const body = lignePatchSchema.parse(await req.json());
    return ok(await patchLigne(Number(params.id), Number(params.ligneId), body));
  });
}
