import { prisma } from '@/lib/prisma';
import { getMatiere } from './matiere';
import type { PrixCreateInput } from '@/lib/validation/prix';

export async function addPrix(matiereId: number, input: PrixCreateInput) {
  await getMatiere(matiereId);
  return prisma.matierePrix.create({
    data: { matiereId, date: new Date(input.date), prix: input.prix },
  });
}

export async function listPrix(matiereId: number) {
  return prisma.matierePrix.findMany({
    where: { matiereId },
    orderBy: { date: 'desc' },
  });
}

export async function currentPrix(matiereId: number): Promise<number | null> {
  const last = await prisma.matierePrix.findFirst({
    where: { matiereId },
    orderBy: { date: 'desc' },
  });
  return last?.prix ?? null;
}
