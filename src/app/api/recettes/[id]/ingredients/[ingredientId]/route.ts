import { requireApiKey, ok, handle } from '@/lib/api';
import { ingredientUpdateSchema } from '@/lib/validation/recette';
import { updateIngredient, removeIngredient } from '@/services/recetteIngredient';

export async function PUT(
  req: Request,
  { params }: { params: { id: string; ingredientId: string } },
) {
  return handle(async () => {
    requireApiKey(req);
    const body = ingredientUpdateSchema.parse(await req.json());
    return ok(await updateIngredient(Number(params.id), Number(params.ingredientId), body));
  });
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; ingredientId: string } },
) {
  return handle(async () => {
    requireApiKey(req);
    await removeIngredient(Number(params.id), Number(params.ingredientId));
    return ok({ ok: true });
  });
}
