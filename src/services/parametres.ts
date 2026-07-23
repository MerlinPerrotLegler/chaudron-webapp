import { prisma } from '@/lib/prisma';
import type { ParametresUpdateInput } from '@/lib/validation/parametres';

export async function getParametres() {
  return prisma.parametres.upsert({
    where: { id: 1 },
    create: { id: 1, tauxHoraireMainOeuvre: 0, inclureMo: true },
    update: {},
  });
}

export async function updateParametres(input: ParametresUpdateInput) {
  await getParametres();
  return prisma.parametres.update({ where: { id: 1 }, data: input });
}
