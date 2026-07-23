import { requireApiKey, ok, handle } from '@/lib/api';
import { sortieMatiereSchema } from '@/lib/validation/stock';
import { sortirMatiere } from '@/services/stock';

export async function POST(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    const body = sortieMatiereSchema.parse(await req.json());
    return ok(await sortirMatiere(body));
  });
}
