import { requireApiKey, created, ok, handle } from '@/lib/api';
import { z } from 'zod';
import { plancheCreateSchema } from '@/lib/validation/terrain';
import { createPlanche, listPlanches } from '@/services/planche';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    const r = await listPlanches({ parcelleId: Number(params.id) });
    return ok(r.items);
  });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    const body = plancheCreateSchema
      .omit({ parcelleId: true })
      .extend({ parcelleId: z.number().int().positive().optional() })
      .parse(await req.json());
    return created(
      await createPlanche({
        ...body,
        parcelleId: Number(params.id),
      }),
    );
  });
}
