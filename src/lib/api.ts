import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError } from './errors';

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data as object, { status });
}

export function created<T>(data: T) {
  return NextResponse.json(data as object, { status: 201 });
}

export function fail(code: string, message: string, status: number, details?: unknown) {
  return NextResponse.json(
    details === undefined ? { code, message } : { code, message, details },
    { status },
  );
}

export function paginated<T>(items: T[], total: number, page: number, pageSize: number) {
  return NextResponse.json({ items, total, page, pageSize });
}

export function requireApiKey(req: Request) {
  const key = req.headers.get('x-api-key');
  if (!key || key !== process.env.API_KEY) {
    throw new AppError('unauthorized', "Clé d'API manquante ou invalide", 401);
  }
}

export async function handle(fn: () => Promise<NextResponse>) {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof AppError) return fail(e.code, e.message, e.status, e.details);
    if (e instanceof ZodError) return fail('validation', 'Requête invalide', 422, e.flatten());
    console.error(e);
    return fail('internal', 'Erreur interne', 500);
  }
}
