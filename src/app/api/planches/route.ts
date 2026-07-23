import { requireApiKey, created, paginated, handle } from '@/lib/api';
import { plancheCreateSchema } from '@/lib/validation/terrain';
import { createPlanche, listPlanches } from '@/services/planche';

export async function GET(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    const url = new URL(req.url);
    const parcelleId = url.searchParams.get('parcelle_id');
    const code = url.searchParams.get('code');
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '50');
    const r = await listPlanches({
      parcelleId: parcelleId ? Number(parcelleId) : undefined,
      code: code ?? undefined,
      page,
      pageSize,
    });
    return paginated(r.items, r.total, r.page, r.pageSize);
  });
}

export async function POST(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    const body = plancheCreateSchema.parse(await req.json());
    return created(await createPlanche(body));
  });
}
