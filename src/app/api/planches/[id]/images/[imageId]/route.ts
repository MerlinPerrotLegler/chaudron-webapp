import { requireApiKey, ok, handle } from '@/lib/api';
import { deletePlancheImage } from '@/services/plancheJournal';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; imageId: string } },
) {
  return handle(async () => {
    requireApiKey(req);
    await deletePlancheImage(Number(params.id), Number(params.imageId));
    return ok({ ok: true });
  });
}
