import { requireApiKey, ok, handle } from '@/lib/api';
import { faisabiliteSchema } from '@/lib/validation/espece';
import { upsertFaisabilite } from '@/services/especeRelations';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    const body = faisabiliteSchema.parse(await req.json());
    return ok(await upsertFaisabilite(Number(params.id), body));
  });
}
