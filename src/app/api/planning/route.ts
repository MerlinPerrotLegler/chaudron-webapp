import { requireApiKey, ok, handle } from '@/lib/api';
import { listPlanning } from '@/services/lotCulture';
import { AppError } from '@/lib/errors';

export async function GET(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    const url = new URL(req.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    if (!from || !to) {
      throw new AppError('validation', 'from et to (YYYY-MM-DD) requis', 422);
    }
    return ok(await listPlanning(from, to));
  });
}
