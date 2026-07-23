import { requireApiKey, created, handle } from '@/lib/api';
import { associationSchema } from '@/lib/validation/espece';
import { addAssociation } from '@/services/especeRelations';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    const body = associationSchema.parse(await req.json());
    return created(await addAssociation(Number(params.id), body));
  });
}
