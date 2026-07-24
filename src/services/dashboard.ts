import { prisma } from '@/lib/prisma';
import { addDays } from '@/lib/dates';
import { listAlertesStock } from './stock';
import { listCommandes } from './commande';

export async function getDashboard() {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const in14 = addDays(today, 14);
  const in7 = addDays(today, 7);
  const fromStr = today.toISOString().slice(0, 10);
  const to14 = in14.toISOString().slice(0, 10);

  const [alertes, productions, etapesCulture, livraisons, aPreparer] =
    await Promise.all([
      listAlertesStock(),
      prisma.production.findMany({
        where: { statut: 'en_cours' },
        take: 20,
        orderBy: { date: 'desc' },
        include: { recette: { select: { nom: true } } },
      }),
      prisma.lotEtape.findMany({
        where: {
          fait: false,
          datePrevue: { gte: today, lte: in7 },
        },
        take: 30,
        orderBy: { datePrevue: 'asc' },
        include: {
          lot: {
            include: {
              espece: { select: { nom: true } },
              planche: { select: { code: true } },
            },
          },
        },
      }),
      listCommandes({
        from: fromStr,
        to: to14,
        pageSize: 30,
      }),
      listCommandes({
        statut: 'confirmee',
        pageSize: 20,
      }),
    ]);

  return {
    alertesStock: alertes,
    productionsEnCours: productions,
    etapesCultureAVenir: etapesCulture,
    livraisonsAVenir: livraisons.items.filter((c) =>
      ['confirmee', 'preparee'].includes(c.statut),
    ),
    commandesAPreparer: aPreparer.items,
  };
}
