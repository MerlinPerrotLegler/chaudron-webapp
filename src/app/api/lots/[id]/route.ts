import { requireApiKey, ok, handle } from '@/lib/api';
import { lotUpdateSchema } from '@/lib/validation/lot';
import { getLot, updateLot, archiveLot } from '@/services/lotCulture';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    return ok(await getLot(Number(params.id)));
  });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    const body = lotUpdateSchema.parse(await req.json());
    return ok(await updateLot(Number(params.id), body));
  });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    return ok(await archiveLot(Number(params.id)));
  });
}
