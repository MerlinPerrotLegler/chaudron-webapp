import { requireApiKey, ok, handle } from '@/lib/api';
import { especeUpdateSchema } from '@/lib/validation/espece';
import { getEspece, updateEspece, archiveEspece } from '@/services/espece';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    return ok(await getEspece(Number(params.id)));
  });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    const body = especeUpdateSchema.parse(await req.json());
    return ok(await updateEspece(Number(params.id), body));
  });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    return ok(await archiveEspece(Number(params.id)));
  });
}
