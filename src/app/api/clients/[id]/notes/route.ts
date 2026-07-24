import { requireApiKey, ok, created, handle } from '@/lib/api';
import { clientNoteSchema } from '@/lib/validation/commercial';
import { addClientNote, listClientNotes } from '@/services/client';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    return ok(await listClientNotes(Number(params.id)));
  });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    const body = clientNoteSchema.parse(await req.json());
    return created(await addClientNote(Number(params.id), body));
  });
}
