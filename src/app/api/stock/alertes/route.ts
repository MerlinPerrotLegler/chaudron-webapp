import { requireApiKey, ok, handle } from '@/lib/api';
import { listAlertesStock } from '@/services/stock';

export async function GET(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    return ok(await listAlertesStock());
  });
}
