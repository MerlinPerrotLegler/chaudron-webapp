import { requireApiKey, ok, handle, fail } from '@/lib/api';
import { listLivraisons } from '@/services/commande';

export async function GET(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    const url = new URL(req.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    if (!from || !to) {
      return fail('validation', 'from et to requis', 422);
    }
    return ok(await listLivraisons({ from, to }));
  });
}
