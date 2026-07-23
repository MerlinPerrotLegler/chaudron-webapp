import { requireApiKey, ok, handle } from '@/lib/api';
import { parcelleUpdateSchema } from '@/lib/validation/terrain';
import { getParcelle, updateParcelle, archiveParcelle } from '@/services/parcelle';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    return ok(await getParcelle(Number(params.id)));
  });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    const body = parcelleUpdateSchema.parse(await req.json());
    return ok(await updateParcelle(Number(params.id), body));
  });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    return ok(await archiveParcelle(Number(params.id)));
  });
}
