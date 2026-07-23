import { requireApiKey, ok, handle } from '@/lib/api';
import { etapeUpdateSchema } from '@/lib/validation/recette';
import { updateEtape, removeEtape } from '@/services/recetteEtape';

export async function PUT(
  req: Request,
  { params }: { params: { id: string; etapeId: string } },
) {
  return handle(async () => {
    requireApiKey(req);
    const body = etapeUpdateSchema.parse(await req.json());
    return ok(await updateEtape(Number(params.id), Number(params.etapeId), body));
  });
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; etapeId: string } },
) {
  return handle(async () => {
    requireApiKey(req);
    await removeEtape(Number(params.id), Number(params.etapeId));
    return ok({ ok: true });
  });
}
