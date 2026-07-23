import { requireApiKey, ok, handle } from '@/lib/api';
import { conditionnementUpdateSchema } from '@/lib/validation/conditionnement';
import {
  getConditionnement,
  updateConditionnement,
  archiveConditionnement,
} from '@/services/conditionnement';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    return ok(await getConditionnement(Number(params.id)));
  });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    const body = conditionnementUpdateSchema.parse(await req.json());
    return ok(await updateConditionnement(Number(params.id), body));
  });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    return ok(await archiveConditionnement(Number(params.id)));
  });
}
