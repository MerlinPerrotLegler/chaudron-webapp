import { requireApiKey, ok, handle } from '@/lib/api';
import { plancheJourSchema, upsertPlancheJour } from '@/services/plancheJournal';

export async function PUT(
  req: Request,
  { params }: { params: { id: string; date: string } },
) {
  return handle(async () => {
    requireApiKey(req);
    const body = plancheJourSchema.parse(await req.json());
    return ok(await upsertPlancheJour(Number(params.id), params.date, body.notes));
  });
}
