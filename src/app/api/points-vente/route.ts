import { requireApiKey, created, ok, handle } from '@/lib/api';
import { pointVenteCreateSchema } from '@/lib/validation/commercial';
import { createPointVente, listPointsVente } from '@/services/pointVente';

export async function GET(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    const url = new URL(req.url);
    return ok(
      await listPointsVente({
        archive: url.searchParams.get('archive') === 'true',
      }),
    );
  });
}

export async function POST(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    const body = pointVenteCreateSchema.parse(await req.json());
    return created(await createPointVente(body));
  });
}
