import { requireApiKey, created, ok, handle } from '@/lib/api';
import { emplacementCreateSchema } from '@/lib/validation/stock';
import { createEmplacement, listEmplacements } from '@/services/stock';

export async function GET(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    return ok(await listEmplacements());
  });
}

export async function POST(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    const body = emplacementCreateSchema.parse(await req.json());
    return created(await createEmplacement(body));
  });
}
