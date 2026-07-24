import { requireApiKey, ok, handle } from '@/lib/api';
import { getProposition, archiveProposition } from '@/services/planification';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    return ok(await getProposition(Number(params.id)));
  });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    return ok(await archiveProposition(Number(params.id)));
  });
}
