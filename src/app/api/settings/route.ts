import { requireApiKey, ok, handle } from '@/lib/api';
import { getSettingsBundle } from '@/services/settings';

export async function GET(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    return ok(await getSettingsBundle());
  });
}
