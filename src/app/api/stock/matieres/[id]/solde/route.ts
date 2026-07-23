import { requireApiKey, ok, handle } from '@/lib/api';
import { soldeMatiere } from '@/services/stock';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    const matiereId = Number(params.id);
    return ok({ matiereId, solde: await soldeMatiere(matiereId) });
  });
}
