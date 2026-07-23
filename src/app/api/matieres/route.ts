import { requireApiKey, created, paginated, handle } from '@/lib/api';
import { matiereCreateSchema } from '@/lib/validation/matiere';
import { createMatiere, listMatieres } from '@/services/matiere';
import type { Provenance } from '@prisma/client';

export async function GET(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    const url = new URL(req.url);
    const provenance = url.searchParams.get('provenance') as Provenance | null;
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '50');
    const r = await listMatieres({
      provenance: provenance ?? undefined,
      page,
      pageSize,
    });
    return paginated(r.items, r.total, r.page, r.pageSize);
  });
}

export async function POST(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    const body = matiereCreateSchema.parse(await req.json());
    return created(await createMatiere(body));
  });
}
