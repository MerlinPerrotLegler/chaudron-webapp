import { requireApiKey, ok, handle } from '@/lib/api';
import { lotEtapePatchSchema } from '@/lib/validation/lot';
import { patchLotEtape } from '@/services/lotCulture';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string; etapeId: string } },
) {
  return handle(async () => {
    requireApiKey(req);
    const body = lotEtapePatchSchema.parse(await req.json());
    return ok(await patchLotEtape(Number(params.id), Number(params.etapeId), body));
  });
}
