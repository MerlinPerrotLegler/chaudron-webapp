import { requireApiKey, ok, created, handle } from '@/lib/api';
import {
  travailSolCreateSchema,
  listTravauxSol,
  addTravailSol,
} from '@/services/plancheJournal';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    return ok(await listTravauxSol(Number(params.id)));
  });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    const body = travailSolCreateSchema.parse(await req.json());
    return created(await addTravailSol(Number(params.id), body));
  });
}
