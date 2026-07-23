import { requireApiKey, created, handle } from '@/lib/api';
import { matiereCreateSchema } from '@/lib/validation/matiere';
import { createMatiere } from '@/services/matiere';

export async function POST(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    const body = matiereCreateSchema.parse(await req.json());
    const m = await createMatiere(body);
    return created(m);
  });
}
