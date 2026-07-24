import { requireApiKey, ok, handle, fail } from '@/lib/api';
import { listBesoins } from '@/services/vente';

export async function GET(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    const url = new URL(req.url);
    const annee = url.searchParams.get('annee');
    if (!annee) return fail('validation', 'annee requise', 422);
    return ok(
      await listBesoins({
        annee: Number(annee),
        inclureCommandes: url.searchParams.get('inclure_commandes') === 'true',
      }),
    );
  });
}
