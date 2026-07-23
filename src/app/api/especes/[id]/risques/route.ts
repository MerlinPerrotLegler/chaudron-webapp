import { requireApiKey, created, handle } from '@/lib/api';
import { risqueSchema } from '@/lib/validation/espece';
import { addRisque } from '@/services/especeRelations';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    const body = risqueSchema.parse(await req.json());
    return created(await addRisque(Number(params.id), body));
  });
}
