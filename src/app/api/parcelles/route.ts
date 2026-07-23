import type { VocationParcelle } from '@prisma/client';
import { requireApiKey, created, paginated, handle } from '@/lib/api';
import { parcelleCreateSchema } from '@/lib/validation/terrain';
import { createParcelle, listParcelles } from '@/services/parcelle';

export async function GET(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    const url = new URL(req.url);
    const vocation = url.searchParams.get('vocation') as VocationParcelle | null;
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '50');
    const r = await listParcelles({
      vocation: vocation ?? undefined,
      page,
      pageSize,
    });
    return paginated(r.items, r.total, r.page, r.pageSize);
  });
}

export async function POST(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    const body = parcelleCreateSchema.parse(await req.json());
    return created(await createParcelle(body));
  });
}
