import { requireApiKey, ok, handle } from '@/lib/api';
import { clientUpdateSchema } from '@/lib/validation/commercial';
import { getClient, updateClient, archiveClient } from '@/services/client';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    return ok(await getClient(Number(params.id)));
  });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    const body = clientUpdateSchema.parse(await req.json());
    return ok(await updateClient(Number(params.id), body));
  });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    return ok(await archiveClient(Number(params.id)));
  });
}
