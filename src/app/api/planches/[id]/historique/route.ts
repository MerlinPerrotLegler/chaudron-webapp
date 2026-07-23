import { requireApiKey, ok, handle } from '@/lib/api';
import { getHistoriquePlanche } from '@/services/plancheJournal';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    const url = new URL(req.url);
    return ok(
      await getHistoriquePlanche(
        Number(params.id),
        url.searchParams.get('from') ?? undefined,
        url.searchParams.get('to') ?? undefined,
      ),
    );
  });
}
