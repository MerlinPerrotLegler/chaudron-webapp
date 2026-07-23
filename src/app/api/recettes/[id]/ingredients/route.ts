import { requireApiKey, ok, created, handle } from '@/lib/api';
import { ingredientCreateSchema } from '@/lib/validation/recette';
import { addIngredient, listIngredients } from '@/services/recetteIngredient';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    return ok(await listIngredients(Number(params.id)));
  });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    const body = ingredientCreateSchema.parse(await req.json());
    return created(await addIngredient(Number(params.id), body));
  });
}
