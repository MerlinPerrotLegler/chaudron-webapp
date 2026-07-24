import { requireApiKey, created, paginated, handle } from '@/lib/api';
import { commandeCreateSchema } from '@/lib/validation/commercial';
import { createCommande, listCommandes } from '@/services/commande';

export async function GET(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    const url = new URL(req.url);
    const r = await listCommandes({
      clientId: url.searchParams.get('client_id')
        ? Number(url.searchParams.get('client_id'))
        : undefined,
      pointVenteId: url.searchParams.get('point_vente_id')
        ? Number(url.searchParams.get('point_vente_id'))
        : undefined,
      statut: url.searchParams.get('statut') ?? undefined,
      from: url.searchParams.get('from') ?? undefined,
      to: url.searchParams.get('to') ?? undefined,
      page: Number(url.searchParams.get('page') ?? '1'),
      pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
    });
    return paginated(r.items, r.total, r.page, r.pageSize);
  });
}

export async function POST(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    const body = commandeCreateSchema.parse(await req.json());
    return created(await createCommande(body));
  });
}
