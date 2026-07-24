import { requireApiKey, ok, created, handle, fail } from '@/lib/api';
import { dateLivraisonSchema } from '@/lib/validation/commercial';
import {
  addDateLivraison,
  listDatesLivraison,
  deleteDateLivraison,
} from '@/services/pointVente';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    return ok(await listDatesLivraison(Number(params.id)));
  });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    const body = dateLivraisonSchema.parse(await req.json());
    return created(await addDateLivraison(Number(params.id), body));
  });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    const url = new URL(req.url);
    const date = url.searchParams.get('date');
    if (!date) {
      return fail('validation', 'Paramètre date requis', 422);
    }
    await deleteDateLivraison(Number(params.id), date);
    return ok({ deleted: true });
  });
}
