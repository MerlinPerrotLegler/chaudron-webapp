import { requireApiKey, ok, handle } from '@/lib/api';
import { matiereUpdateSchema } from '@/lib/validation/matiere';
import { getMatiere, updateMatiere, archiveMatiere } from '@/services/matiere';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    const m = await getMatiere(Number(params.id));
    return ok(m);
  });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    const body = matiereUpdateSchema.parse(await req.json());
    return ok(await updateMatiere(Number(params.id), body));
  });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    return ok(await archiveMatiere(Number(params.id)));
  });
}
