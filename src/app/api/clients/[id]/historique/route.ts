import { requireApiKey, ok, handle } from '@/lib/api';
import { getClientHistorique } from '@/services/client';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    const url = new URL(req.url);
    return ok(
      await getClientHistorique(Number(params.id), {
        from: url.searchParams.get('from') ?? undefined,
        to: url.searchParams.get('to') ?? undefined,
      }),
    );
  });
}
