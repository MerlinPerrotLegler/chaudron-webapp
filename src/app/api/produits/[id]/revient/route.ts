import { requireApiKey, ok, handle } from '@/lib/api';
import { getRevientOrThrow } from '@/services/produitRevient';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    return ok(await getRevientOrThrow(Number(params.id)));
  });
}
