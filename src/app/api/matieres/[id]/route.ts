import { requireApiKey, ok, handle } from '@/lib/api';
import { getMatiere } from '@/services/matiere';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    const m = await getMatiere(Number(params.id));
    return ok(m);
  });
}
