import { z } from 'zod';
import { requireApiKey, ok, created, handle } from '@/lib/api';
import { createEquipement, listEquipements } from '@/services/equipement';

const equipementCreateSchema = z.object({ nom: z.string().min(1) });

export async function GET(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    return ok(await listEquipements());
  });
}

export async function POST(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    const body = equipementCreateSchema.parse(await req.json());
    return created(await createEquipement(body));
  });
}
