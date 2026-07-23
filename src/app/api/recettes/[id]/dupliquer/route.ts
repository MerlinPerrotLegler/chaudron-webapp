import { requireApiKey, created, handle } from '@/lib/api';
import { dupliquerRecette } from '@/services/recette';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    return created(await dupliquerRecette(Number(params.id)));
  });
}
