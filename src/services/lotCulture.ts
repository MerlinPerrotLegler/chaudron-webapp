import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import { emit } from '@/lib/webhooks';
import { addDays, parseDateOnly } from '@/lib/dates';
import { getEspece } from './espece';
import { getPlanche } from './planche';
import type { LotCreateInput, LotUpdateInput, LotEtapePatchInput } from '@/lib/validation/lot';

async function cascadeForward(lotId: number, fromOrdre: number) {
  const etapes = await prisma.lotEtape.findMany({
    where: { lotId },
    orderBy: { ordre: 'asc' },
  });
  let prevDate: Date | null = null;
  for (const e of etapes) {
    if (e.ordre < fromOrdre) {
      prevDate = e.datePrevue;
      continue;
    }
    if (e.ordre === fromOrdre) {
      prevDate = e.datePrevue;
      continue;
    }
    if (e.decouplee || e.verrouillee) {
      prevDate = e.datePrevue;
      continue;
    }
    if (!prevDate) {
      prevDate = e.datePrevue;
      continue;
    }
    const next = addDays(prevDate, e.dureeDepuisPrecedenteJours);
    await prisma.lotEtape.update({
      where: { id: e.id },
      data: { datePrevue: next },
    });
    prevDate = next;
  }
}

export async function createLot(input: LotCreateInput) {
  const espece = await getEspece(input.especeId);
  if (espece.archivee) throw new AppError('conflict', 'Espèce archivée', 409);
  const planche = await getPlanche(input.plancheId);
  if (planche.archivee) throw new AppError('conflict', 'Planche archivée', 409);
  if (input.surfaceM2 > planche.surfaceM2) {
    throw new AppError(
      'validation',
      `surface lot (${input.surfaceM2}) > planche (${planche.surfaceM2})`,
      422,
    );
  }

  const itin = await prisma.itineraireEtape.findMany({
    where: { especeId: input.especeId },
    orderBy: { ordre: 'asc' },
  });

  const lot = await prisma.$transaction(async (tx) => {
    const l = await tx.lotCulture.create({
      data: {
        especeId: input.especeId,
        plancheId: input.plancheId,
        annee: input.annee,
        surfaceM2: input.surfaceM2,
        priorite: input.priorite ?? 'P2',
        notes: input.notes,
      },
    });

    let date = input.dateDebut ? parseDateOnly(input.dateDebut) : null;
    let isFirst = true;
    for (const step of itin) {
      if (!isFirst && date) {
        date = addDays(date, step.dureeDepuisPrecedenteJours);
      }
      await tx.lotEtape.create({
        data: {
          lotId: l.id,
          ordre: step.ordre,
          code: step.code,
          libelle: step.libelle,
          dureeDepuisPrecedenteJours: step.dureeDepuisPrecedenteJours,
          fenetreDebutMmdd: step.fenetreDebutMmdd,
          fenetreFinMmdd: step.fenetreFinMmdd,
          description: step.description,
          datePrevue: date,
        },
      });
      isFirst = false;
    }
    return l;
  });

  await emit('lot.cree', {
    id: lot.id,
    espece_id: lot.especeId,
    planche_id: lot.plancheId,
    annee: lot.annee,
    etat: lot.etat,
    surface_m2: lot.surfaceM2,
  });
  return getLot(lot.id);
}

export async function listLots(params: {
  annee?: number;
  plancheId?: number;
  parcelleId?: number;
  especeId?: number;
  page?: number;
  pageSize?: number;
}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 50;
  const where = {
    archive: false,
    ...(params.annee ? { annee: params.annee } : {}),
    ...(params.plancheId ? { plancheId: params.plancheId } : {}),
    ...(params.especeId ? { especeId: params.especeId } : {}),
    ...(params.parcelleId ? { planche: { parcelleId: params.parcelleId } } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.lotCulture.findMany({
      where,
      orderBy: { id: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        etapes: { orderBy: { ordre: 'asc' } },
        espece: { select: { id: true, nom: true } },
        planche: { select: { id: true, code: true } },
      },
    }),
    prisma.lotCulture.count({ where }),
  ]);
  return { items, total, page, pageSize };
}

export async function getLot(id: number) {
  const l = await prisma.lotCulture.findUnique({
    where: { id },
    include: { etapes: { orderBy: { ordre: 'asc' } }, espece: true, planche: true },
  });
  if (!l) throw new AppError('not_found', `Lot ${id} introuvable`, 404);
  return l;
}

export async function updateLot(id: number, input: LotUpdateInput) {
  const lot = await getLot(id);
  if (input.surfaceM2 != null && input.surfaceM2 > lot.planche.surfaceM2) {
    throw new AppError('validation', 'surface lot > planche', 422);
  }
  const prevEtat = lot.etat;
  const u = await prisma.lotCulture.update({ where: { id }, data: input });
  if (input.etat && input.etat !== prevEtat) {
    await emit('lot.etat_change', { id, etat: u.etat });
  } else {
    await emit('lot.maj', {
      id: u.id,
      espece_id: u.especeId,
      planche_id: u.plancheId,
      annee: u.annee,
      etat: u.etat,
      surface_m2: u.surfaceM2,
    });
  }
  return getLot(id);
}

export async function archiveLot(id: number) {
  await getLot(id);
  return prisma.lotCulture.update({ where: { id }, data: { archive: true } });
}

export async function patchLotEtape(lotId: number, etapeId: number, input: LotEtapePatchInput) {
  const lot = await getLot(lotId);
  const etape = lot.etapes.find((e) => e.id === etapeId);
  if (!etape) throw new AppError('not_found', `Étape lot ${etapeId} introuvable`, 404);

  const data: {
    datePrevue?: Date;
    verrouillee?: boolean;
    decouplee?: boolean;
    dateReelle?: Date | null;
    fait?: boolean;
    dureeDepuisPrecedenteJours?: number;
  } = {};
  if (input.datePrevue) data.datePrevue = parseDateOnly(input.datePrevue);
  if (input.verrouillee !== undefined) data.verrouillee = input.verrouillee;
  if (input.decouplee !== undefined) data.decouplee = input.decouplee;
  if (input.fait !== undefined) data.fait = input.fait;
  if (input.dureeDepuisPrecedenteJours !== undefined) {
    data.dureeDepuisPrecedenteJours = input.dureeDepuisPrecedenteJours;
  }
  if (input.dateReelle !== undefined) {
    data.dateReelle = input.dateReelle ? parseDateOnly(input.dateReelle) : null;
  }

  await prisma.lotEtape.update({ where: { id: etapeId }, data });

  if (input.datePrevue && !etape.decouplee && !(input.decouplee === true)) {
    await cascadeForward(lotId, etape.ordre);
  }

  const updated = await getLot(lotId);
  await emit('lot.planning_maj', {
    lot_id: lotId,
    etapes: updated.etapes.map((e) => ({
      id: e.id,
      ordre: e.ordre,
      date_prevue: e.datePrevue,
    })),
  });
  return updated;
}

export async function reappliquerItineraire(lotId: number, dateDebut?: string) {
  const lot = await getLot(lotId);
  const itin = await prisma.itineraireEtape.findMany({
    where: { especeId: lot.especeId },
    orderBy: { ordre: 'asc' },
  });

  await prisma.$transaction(async (tx) => {
    await tx.lotEtape.deleteMany({ where: { lotId } });
    let date = dateDebut ? parseDateOnly(dateDebut) : null;
    let first = true;
    for (const step of itin) {
      if (!first && date) {
        date = addDays(date, step.dureeDepuisPrecedenteJours);
      }
      await tx.lotEtape.create({
        data: {
          lotId,
          ordre: step.ordre,
          code: step.code,
          libelle: step.libelle,
          dureeDepuisPrecedenteJours: step.dureeDepuisPrecedenteJours,
          fenetreDebutMmdd: step.fenetreDebutMmdd,
          fenetreFinMmdd: step.fenetreFinMmdd,
          description: step.description,
          datePrevue: date,
        },
      });
      if (first && dateDebut) {
        date = parseDateOnly(dateDebut);
        first = false;
      } else {
        first = false;
      }
    }
  });

  return getLot(lotId);
}

export async function getConflitsLot(lotId: number) {
  const lot = await getLot(lotId);
  const warnings: { code: string; message: string; severity: 'error' | 'warning' | 'info' }[] =
    [];

  if (lot.surfaceM2 > lot.planche.surfaceM2) {
    warnings.push({
      code: 'surface_depasse_planche',
      message: 'Surface du lot > surface de la planche',
      severity: 'error',
    });
  }

  const dates = lot.etapes.map((e) => e.datePrevue).filter(Boolean) as Date[];
  const from = dates.length ? new Date(Math.min(...dates.map((d) => d.getTime()))) : null;
  const to = dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : null;

  const autres = await prisma.lotCulture.findMany({
    where: {
      plancheId: lot.plancheId,
      archive: false,
      id: { not: lotId },
      etat: { notIn: ['termine', 'abandonne'] },
    },
    include: { etapes: true },
  });

  let surfaceChevauche = lot.surfaceM2;
  for (const a of autres) {
    const ad = a.etapes.map((e) => e.datePrevue).filter(Boolean) as Date[];
    if (!from || !to || ad.length === 0) {
      surfaceChevauche += a.surfaceM2;
      continue;
    }
    const af = new Date(Math.min(...ad.map((d) => d.getTime())));
    const at = new Date(Math.max(...ad.map((d) => d.getTime())));
    const overlap = af <= to && at >= from;
    if (overlap) surfaceChevauche += a.surfaceM2;
  }

  if (surfaceChevauche > lot.planche.surfaceM2) {
    warnings.push({
      code: 'surfacage_planche',
      message: `Σ surfaces chevauchantes (${surfaceChevauche}) > planche (${lot.planche.surfaceM2})`,
      severity: 'error',
    });
  } else if (autres.length > 0) {
    warnings.push({
      code: 'cohabitation_planche',
      message: 'Autres lots sur la même planche (surfaces OK)',
      severity: 'warning',
    });
  }

  return { lotId, conflits: warnings };
}

export async function listPlanning(from: string, to: string) {
  const fromD = parseDateOnly(from);
  const toD = parseDateOnly(to);
  const etapes = await prisma.lotEtape.findMany({
    where: {
      datePrevue: { gte: fromD, lte: toD },
      lot: { archive: false },
    },
    include: {
      lot: {
        include: {
          espece: { select: { id: true, nom: true } },
          planche: { select: { id: true, code: true } },
        },
      },
    },
    orderBy: { datePrevue: 'asc' },
  });
  return etapes;
}
