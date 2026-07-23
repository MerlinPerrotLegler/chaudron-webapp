import { requireApiKey, ok, created, handle } from '@/lib/api';
import { etapeCreateSchema } from '@/lib/validation/recette';
import { addEtape, listEtapes } from '@/services/recetteEtape';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    return ok(await listEtapes(Number(params.id)));
  });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    const body = etapeCreateSchema.parse(await req.json());
    return created(await addEtape(Number(params.id), body));
  });
}
