import { requireApiKey, ok, handle } from '@/lib/api';
import { plancheUpdateSchema } from '@/lib/validation/terrain';
import { getPlanche, updatePlanche, archivePlanche } from '@/services/planche';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    return ok(await getPlanche(Number(params.id)));
  });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    const body = plancheUpdateSchema.parse(await req.json());
    return ok(await updatePlanche(Number(params.id), body));
  });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    return ok(await archivePlanche(Number(params.id)));
  });
}
