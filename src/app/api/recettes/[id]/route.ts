import { requireApiKey, ok, handle } from '@/lib/api';
import { recetteUpdateSchema } from '@/lib/validation/recette';
import { getRecette, updateRecette, archiveRecette } from '@/services/recette';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    return ok(await getRecette(Number(params.id)));
  });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    const body = recetteUpdateSchema.parse(await req.json());
    return ok(await updateRecette(Number(params.id), body));
  });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    return ok(await archiveRecette(Number(params.id)));
  });
}
