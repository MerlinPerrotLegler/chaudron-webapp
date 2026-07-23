import type { FamilleRecette } from '@prisma/client';
import { requireApiKey, created, paginated, handle } from '@/lib/api';
import { recetteCreateSchema } from '@/lib/validation/recette';
import { createRecette, listRecettes } from '@/services/recette';

export async function GET(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    const url = new URL(req.url);
    const famille = url.searchParams.get('famille') as FamilleRecette | null;
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '50');
    const r = await listRecettes({
      famille: famille ?? undefined,
      page,
      pageSize,
    });
    return paginated(r.items, r.total, r.page, r.pageSize);
  });
}

export async function POST(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    const body = recetteCreateSchema.parse(await req.json());
    return created(await createRecette(body));
  });
}
