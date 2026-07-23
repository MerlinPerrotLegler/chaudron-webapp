import { requireApiKey, created, ok, handle } from '@/lib/api';
import { itineraireEtapeSchema } from '@/lib/validation/espece';
import { addItineraireEtape } from '@/services/especeRelations';
import { getEspece } from '@/services/espece';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    const e = await getEspece(Number(params.id));
    return ok(e.itineraires);
  });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    const body = itineraireEtapeSchema.parse(await req.json());
    return created(await addItineraireEtape(Number(params.id), body));
  });
}
