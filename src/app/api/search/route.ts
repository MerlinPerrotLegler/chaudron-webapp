import { requireApiKey, ok, handle, fail } from '@/lib/api';
import { searchGlobal } from '@/services/search';

export async function GET(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    const q = new URL(req.url).searchParams.get('q') ?? '';
    if (!q) return fail('validation', 'q requis', 422);
    return ok(await searchGlobal(q));
  });
}
