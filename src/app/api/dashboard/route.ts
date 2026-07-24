import { requireApiKey, ok, handle } from '@/lib/api';
import { getDashboard } from '@/services/dashboard';

export async function GET(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    return ok(await getDashboard());
  });
}
