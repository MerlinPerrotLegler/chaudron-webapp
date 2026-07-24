import type { TypeClient } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import { emit } from '@/lib/webhooks';
import { parseDateOnly } from '@/lib/dates';

export async function createClient(input: {
  nom: string;
  type?: TypeClient;
  contactNom?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  codePostal?: string;
  ville?: string;
  conditionsLivraison?: string;
  notes?: string;
}) {
  const existing = await prisma.client.findUnique({ where: { nom: input.nom } });
  if (existing) {
    throw new AppError('conflict', `Client « ${input.nom} » existe déjà`, 409);
  }
  const c = await prisma.client.create({ data: input });
  await emit('client.cree', { id: c.id, nom: c.nom, type: c.type });
  return c;
}

export async function listClients(params: {
  q?: string;
  archive?: boolean;
  page?: number;
  pageSize?: number;
} = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 50;
  const where = {
    archive: params.archive ?? false,
    ...(params.q
      ? { nom: { contains: params.q } }
      : {}),
  };
  const [items, total] = await Promise.all([
    prisma.client.findMany({
      where,
      orderBy: { nom: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.client.count({ where }),
  ]);
  return { items, total, page, pageSize };
}

export async function getClient(id: number) {
  const c = await prisma.client.findUnique({ where: { id } });
  if (!c) throw new AppError('not_found', `Client ${id} introuvable`, 404);
  return c;
}

export async function updateClient(
  id: number,
  input: Partial<{
    nom: string;
    type: TypeClient | null;
    contactNom: string | null;
    email: string | null;
    telephone: string | null;
    adresse: string | null;
    codePostal: string | null;
    ville: string | null;
    conditionsLivraison: string | null;
    notes: string | null;
  }>,
) {
  await getClient(id);
  if (input.nom) {
    const clash = await prisma.client.findFirst({
      where: { nom: input.nom, NOT: { id } },
    });
    if (clash) {
      throw new AppError('conflict', `Client « ${input.nom} » existe déjà`, 409);
    }
  }
  const c = await prisma.client.update({ where: { id }, data: input });
  await emit('client.maj', { id: c.id, nom: c.nom });
  return c;
}

export async function archiveClient(id: number) {
  await getClient(id);
  const actives = await prisma.commande.count({
    where: {
      clientId: id,
      statut: { in: ['brouillon', 'confirmee', 'preparee'] },
    },
  });
  if (actives > 0) {
    throw new AppError('conflict', 'Client avec commandes non terminées', 409, {
      commandesActives: actives,
    });
  }
  return prisma.client.update({ where: { id }, data: { archive: true } });
}

export async function addClientNote(
  clientId: number,
  input: { date: string; texte: string; operateurNom?: string },
) {
  await getClient(clientId);
  return prisma.clientNote.create({
    data: {
      clientId,
      date: parseDateOnly(input.date),
      texte: input.texte,
      operateurNom: input.operateurNom,
    },
  });
}

export async function listClientNotes(clientId: number) {
  await getClient(clientId);
  return prisma.clientNote.findMany({
    where: { clientId },
    orderBy: { date: 'desc' },
  });
}

export type HistoriqueEntry = {
  date: string;
  type: 'note' | 'commande' | 'vente';
  libelle: string;
  montant?: number;
  ref_id: number;
  notes?: string | null;
};

export async function getClientHistorique(
  clientId: number,
  params: { from?: string; to?: string } = {},
): Promise<HistoriqueEntry[]> {
  await getClient(clientId);
  const from = params.from ? parseDateOnly(params.from) : undefined;
  const to = params.to ? parseDateOnly(params.to) : undefined;
  const dateFilter = {
    ...(from || to
      ? {
          date: {
            ...(from ? { gte: from } : {}),
            ...(to ? { lte: to } : {}),
          },
        }
      : {}),
  };

  const [notes, commandes, ventes] = await Promise.all([
    prisma.clientNote.findMany({
      where: { clientId, ...dateFilter },
    }),
    prisma.commande.findMany({
      where: {
        clientId,
        ...(from || to
          ? {
              dateCommande: {
                ...(from ? { gte: from } : {}),
                ...(to ? { lte: to } : {}),
              },
            }
          : {}),
      },
      include: { lignes: true },
    }),
    prisma.venteLigne.findMany({
      where: {
        clientId,
        statut: 'validee',
        ...(from || to
          ? {
              date: {
                ...(from ? { gte: from } : {}),
                ...(to ? { lte: to } : {}),
              },
            }
          : {}),
      },
      include: { produitFini: { include: { recette: true } } },
    }),
  ]);

  const entries: HistoriqueEntry[] = [];
  for (const n of notes) {
    entries.push({
      date: n.date.toISOString().slice(0, 10),
      type: 'note',
      libelle: n.texte.slice(0, 120),
      ref_id: n.id,
      notes: n.texte,
    });
  }
  for (const c of commandes) {
    const montant = c.lignes.reduce((s, l) => s + l.montant, 0);
    entries.push({
      date: c.dateCommande.toISOString().slice(0, 10),
      type: 'commande',
      libelle: `Commande #${c.id} (${c.statut}) — livraison ${c.dateLivraison.toISOString().slice(0, 10)}`,
      montant,
      ref_id: c.id,
      notes: c.notes,
    });
  }
  for (const v of ventes) {
    entries.push({
      date: v.date.toISOString().slice(0, 10),
      type: 'vente',
      libelle: `Vente ${v.produitFini.recette.nom} × ${v.quantite}`,
      montant: v.montant,
      ref_id: v.id,
      notes: v.notes,
    });
  }

  entries.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return entries;
}
