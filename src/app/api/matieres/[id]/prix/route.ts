import { requireApiKey, ok, created, handle } from '@/lib/api';
import { prixCreateSchema } from '@/lib/validation/prix';
import { addPrix, listPrix } from '@/services/matierePrix';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    return ok(await listPrix(Number(params.id)));
  });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    const body = prixCreateSchema.parse(await req.json());
    return created(await addPrix(Number(params.id), body));
  });
}
