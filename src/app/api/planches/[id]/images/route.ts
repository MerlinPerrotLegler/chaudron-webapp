import { requireApiKey, ok, created, handle } from '@/lib/api';
import {
  plancheImageCreateSchema,
  addPlancheImage,
  listPlancheImages,
} from '@/services/plancheJournal';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    return ok(await listPlancheImages(Number(params.id)));
  });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    const body = plancheImageCreateSchema.parse(await req.json());
    return created(await addPlancheImage(Number(params.id), body));
  });
}
