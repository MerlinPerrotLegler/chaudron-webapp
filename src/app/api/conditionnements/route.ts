import { requireApiKey, created, paginated, handle } from '@/lib/api';
import { conditionnementCreateSchema } from '@/lib/validation/conditionnement';
import {
  createConditionnement,
  listConditionnements,
} from '@/services/conditionnement';

export async function GET(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    const url = new URL(req.url);
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '50');
    const r = await listConditionnements({ page, pageSize });
    return paginated(r.items, r.total, r.page, r.pageSize);
  });
}

export async function POST(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    const body = conditionnementCreateSchema.parse(await req.json());
    return created(await createConditionnement(body));
  });
}
