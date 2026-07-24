import { requireApiKey, created, ok, handle } from '@/lib/api';
import { propositionCreateSchema } from '@/lib/validation/planification';
import { genererProposition, listPropositions } from '@/services/planification';

export async function GET(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    const url = new URL(req.url);
    const annee = url.searchParams.get('annee');
    return ok(await listPropositions(annee ? Number(annee) : undefined));
  });
}

export async function POST(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    const body = propositionCreateSchema.parse(await req.json());
    return created(await genererProposition(body));
  });
}
