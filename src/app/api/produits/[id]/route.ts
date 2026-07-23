import { requireApiKey, ok, handle } from '@/lib/api';
import { produitUpdateSchema } from '@/lib/validation/produit';
import { getProduit, updateProduit } from '@/services/produit';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    return ok(await getProduit(Number(params.id)));
  });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    const body = produitUpdateSchema.parse(await req.json());
    return ok(await updateProduit(Number(params.id), body));
  });
}
