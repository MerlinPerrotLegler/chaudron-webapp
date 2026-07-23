import { requireApiKey, created, paginated, handle, ok } from '@/lib/api';
import { especeCreateSchema } from '@/lib/validation/espece';
import { createEspece, listEspeces } from '@/services/espece';

export async function GET(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    const url = new URL(req.url);
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '50');
    const r = await listEspeces({ page, pageSize });
    return paginated(r.items, r.total, r.page, r.pageSize);
  });
}

export async function POST(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    const body = especeCreateSchema.parse(await req.json());
    return created(await createEspece(body));
  });
}
