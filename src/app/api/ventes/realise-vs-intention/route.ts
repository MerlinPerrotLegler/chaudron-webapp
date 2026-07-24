import { requireApiKey, ok, handle, fail } from '@/lib/api';
import { realiseVsIntention } from '@/services/intention';

export async function GET(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    const url = new URL(req.url);
    const annee = url.searchParams.get('annee');
    if (!annee) return fail('validation', 'annee requise', 422);
    return ok(await realiseVsIntention(Number(annee)));
  });
}
