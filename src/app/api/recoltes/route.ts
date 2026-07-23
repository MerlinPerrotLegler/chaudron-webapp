import { requireApiKey, created, paginated, handle } from '@/lib/api';
import { recolteCreateSchema } from '@/lib/validation/lot';
import { declareRecolte, listRecoltes } from '@/services/recolte';

export async function GET(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    const url = new URL(req.url);
    const r = await listRecoltes({
      lotId: url.searchParams.get('lot_id')
        ? Number(url.searchParams.get('lot_id'))
        : undefined,
      campagneId: url.searchParams.get('campagne_id') ?? undefined,
      page: Number(url.searchParams.get('page') ?? '1'),
      pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
    });
    return paginated(r.items, r.total, r.page, r.pageSize);
  });
}

export async function POST(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    const body = recolteCreateSchema.parse(await req.json());
    return created(await declareRecolte(body));
  });
}
