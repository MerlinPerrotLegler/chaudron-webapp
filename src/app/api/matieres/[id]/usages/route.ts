import { requireApiKey, ok, handle } from '@/lib/api';
import { getMatiereUsages } from '@/services/matiere';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    return ok(await getMatiereUsages(Number(params.id)));
  });
}
