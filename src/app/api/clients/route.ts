import { requireApiKey, created, paginated, handle } from '@/lib/api';
import { clientCreateSchema } from '@/lib/validation/commercial';
import { createClient, listClients } from '@/services/client';

export async function GET(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    const url = new URL(req.url);
    const r = await listClients({
      q: url.searchParams.get('q') ?? undefined,
      archive: url.searchParams.get('archive') === 'true',
      page: Number(url.searchParams.get('page') ?? '1'),
      pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
    });
    return paginated(r.items, r.total, r.page, r.pageSize);
  });
}

export async function POST(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    const body = clientCreateSchema.parse(await req.json());
    const data = {
      ...body,
      email: body.email === '' ? undefined : body.email,
    };
    return created(await createClient(data));
  });
}
