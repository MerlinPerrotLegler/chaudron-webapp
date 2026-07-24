import { requireApiKey, ok, handle } from '@/lib/api';
import { pointVenteUpdateSchema } from '@/lib/validation/commercial';
import {
  getPointVente,
  updatePointVente,
  archivePointVente,
} from '@/services/pointVente';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    return ok(await getPointVente(Number(params.id)));
  });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    const body = pointVenteUpdateSchema.parse(await req.json());
    return ok(await updatePointVente(Number(params.id), body));
  });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    return ok(await archivePointVente(Number(params.id)));
  });
}
