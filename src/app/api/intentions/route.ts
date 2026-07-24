import { requireApiKey, ok, created, handle } from '@/lib/api';
import { intentionSchema } from '@/lib/validation/commercial';
import { upsertIntention, listIntentions } from '@/services/intention';
import { emit } from '@/lib/webhooks';

export async function GET(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    const url = new URL(req.url);
    const annee = url.searchParams.get('annee');
    return ok(await listIntentions(annee ? Number(annee) : undefined));
  });
}

export async function PUT(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    const body = intentionSchema.parse(await req.json());
    const row = await upsertIntention(body);
    await emit('intention.maj', {
      produit_fini_id: row.produitFiniId,
      annee: row.annee,
      unites_visees: row.unitesVisees,
    });
    return ok(row);
  });
}

export async function POST(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    const body = intentionSchema.parse(await req.json());
    const row = await upsertIntention(body);
    await emit('intention.maj', {
      produit_fini_id: row.produitFiniId,
      annee: row.annee,
      unites_visees: row.unitesVisees,
    });
    return created(row);
  });
}
