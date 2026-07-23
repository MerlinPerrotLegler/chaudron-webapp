import { requireApiKey, ok, created, handle } from '@/lib/api';
import { entrantCreateSchema, listEntrants, addEntrant } from '@/services/plancheJournal';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    return ok(await listEntrants(Number(params.id)));
  });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    const body = entrantCreateSchema.parse(await req.json());
    return created(await addEntrant(Number(params.id), body));
  });
}
