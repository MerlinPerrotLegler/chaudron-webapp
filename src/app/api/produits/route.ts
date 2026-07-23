import { requireApiKey, created, paginated, handle } from '@/lib/api';
import { produitCreateSchema } from '@/lib/validation/produit';
import { createProduit, listProduits } from '@/services/produit';

export async function GET(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    const url = new URL(req.url);
    const actifParam = url.searchParams.get('actif');
    const actif =
      actifParam === null ? undefined : actifParam === 'true' || actifParam === '1';
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '50');
    const r = await listProduits({ actif, page, pageSize });
    return paginated(r.items, r.total, r.page, r.pageSize);
  });
}

export async function POST(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    const body = produitCreateSchema.parse(await req.json());
    return created(await createProduit(body));
  });
}
