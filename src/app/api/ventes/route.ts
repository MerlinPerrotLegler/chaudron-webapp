import { requireApiKey, ok, created, paginated, handle } from '@/lib/api';
import { venteDirecteSchema } from '@/lib/validation/commercial';
import { declareVenteDirecte, listVentes } from '@/services/vente';

export async function GET(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    const url = new URL(req.url);
    const r = await listVentes({
      from: url.searchParams.get('from') ?? undefined,
      to: url.searchParams.get('to') ?? undefined,
      produitFiniId: url.searchParams.get('produit_fini_id')
        ? Number(url.searchParams.get('produit_fini_id'))
        : undefined,
      pointVenteId: url.searchParams.get('point_vente_id')
        ? Number(url.searchParams.get('point_vente_id'))
        : undefined,
      clientId: url.searchParams.get('client_id')
        ? Number(url.searchParams.get('client_id'))
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
    const body = venteDirecteSchema.parse(await req.json());
    return created(await declareVenteDirecte(body));
  });
}
