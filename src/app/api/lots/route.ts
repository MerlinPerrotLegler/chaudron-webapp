import { requireApiKey, created, paginated, handle } from '@/lib/api';
import { lotCreateSchema } from '@/lib/validation/lot';
import { createLot, listLots } from '@/services/lotCulture';

export async function GET(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    const url = new URL(req.url);
    const r = await listLots({
      annee: url.searchParams.get('annee')
        ? Number(url.searchParams.get('annee'))
        : undefined,
      plancheId: url.searchParams.get('planche_id')
        ? Number(url.searchParams.get('planche_id'))
        : undefined,
      parcelleId: url.searchParams.get('parcelle_id')
        ? Number(url.searchParams.get('parcelle_id'))
        : undefined,
      especeId: url.searchParams.get('espece_id')
        ? Number(url.searchParams.get('espece_id'))
        : undefined,
      page: Number(url.searchParams.get('page') ?? '1'),
      pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
    });
    return paginated(r.items, r.total, r.page, r.pageSize);
  });
}

export async function POST(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    const body = lotCreateSchema.parse(await req.json());
    return created(await createLot(body));
  });
}
