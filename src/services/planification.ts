import type { FaisabiliteLigne, NiveauFaisabilite, PrioriteLot, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import { emit } from '@/lib/webhooks';
import { listBesoins } from './vente';
import { soldeMatiere } from './stock';
import { createLot } from './lotCulture';
import { getParametres } from './parametres';

const PRIORITE_RANK: Record<PrioriteLot, number> = { P1: 1, P2: 2, P3: 3 };

type AggEspece = {
  especeId: number;
  matiereId: number;
  besoinKgBrut: number;
  priorite: PrioriteLot;
};

async function aggregateBesoinsParEspece(
  annee: number,
  inclureCommandes: boolean,
): Promise<AggEspece[]> {
  const besoins = await listBesoins({ annee, inclureCommandes });
  const intentions = await prisma.intentionVente.findMany({ where: { annee } });
  let prioriteGlobale: PrioriteLot = 'P2';
  for (const i of intentions) {
    if (PRIORITE_RANK[i.priorite] < PRIORITE_RANK[prioriteGlobale]) {
      prioriteGlobale = i.priorite;
    }
  }

  const byEspece = new Map<number, AggEspece>();
  for (const b of besoins) {
    const matiere = await prisma.matiere.findUnique({ where: { id: b.matiereId } });
    if (!matiere || matiere.provenance !== 'fermiere' || !matiere.especeId) continue;

    const prev = byEspece.get(matiere.especeId);
    if (prev) {
      prev.besoinKgBrut += b.quantite;
    } else {
      byEspece.set(matiere.especeId, {
        especeId: matiere.especeId,
        matiereId: matiere.id,
        besoinKgBrut: b.quantite,
        priorite: prioriteGlobale,
      });
    }
  }

  return [...byEspece.values()];
}

async function surfaceDisponiblePlanche(plancheId: number, annee: number): Promise<number> {
  const planche = await prisma.planche.findUniqueOrThrow({ where: { id: plancheId } });
  const lots = await prisma.lotCulture.findMany({
    where: {
      plancheId,
      annee,
      archive: false,
      etat: { notIn: ['termine', 'abandonne'] },
    },
  });
  const occupe = lots.reduce((s, l) => s + l.surfaceM2, 0);
  return Math.max(0, planche.surfaceM2 - occupe);
}

function mapFaisabilite(n: NiveauFaisabilite | undefined): FaisabiliteLigne {
  if (!n) return 'jaune';
  if (n === 'vert') return 'vert';
  if (n === 'jaune') return 'jaune';
  return 'rouge';
}

export async function genererProposition(input: {
  annee: number;
  inclureCommandes?: boolean;
  parametres?: { ignorerStock?: boolean; filtreEau?: string };
  notes?: string;
}) {
  const inclureCommandes = input.inclureCommandes ?? false;
  const params = await getParametres();
  const aggs = await aggregateBesoinsParEspece(input.annee, inclureCommandes);

  const last = await prisma.propositionPlan.findFirst({
    where: { annee: input.annee },
    orderBy: { version: 'desc' },
  });
  const version = (last?.version ?? 0) + 1;

  // Archive previous active for this year
  await prisma.propositionPlan.updateMany({
    where: { annee: input.annee, statut: 'active' },
    data: { statut: 'archivee' },
  });

  const lignesData: Prisma.PropositionLigneCreateWithoutPropositionInput[] = [];

  // Track remaining free surface per planche during allocation
  const planches = await prisma.planche.findMany({
    where: { archivee: false },
    include: { parcelle: true },
  });
  const free = new Map<number, number>();
  for (const p of planches) {
    free.set(p.id, await surfaceDisponiblePlanche(p.id, input.annee));
  }

  const sorted = [...aggs].sort((a, b) => {
    const pr = PRIORITE_RANK[a.priorite] - PRIORITE_RANK[b.priorite];
    if (pr !== 0) return pr;
    return b.besoinKgBrut - a.besoinKgBrut;
  });

  for (const agg of sorted) {
    const espece = await prisma.espece.findUniqueOrThrow({
      where: { id: agg.especeId },
      include: { faisabilites: true },
    });

    // Vivaces déjà en place
    const vivaces = await prisma.lotCulture.findMany({
      where: {
        especeId: agg.especeId,
        archive: false,
        etat: { notIn: ['termine', 'abandonne'] },
        espece: { cycle: 'vivace' },
      },
      include: { espece: true },
    });

    let stockKg = 0;
    if (!input.parametres?.ignorerStock) {
      const matieres = await prisma.matiere.findMany({
        where: { especeId: agg.especeId, archivee: false },
      });
      for (const m of matieres) {
        stockKg += await soldeMatiere(m.id);
      }
    }

    let besoinNet = Math.max(0, agg.besoinKgBrut - stockKg);
    let lotExistantId: number | undefined;
    if (vivaces.length > 0 && besoinNet > 0) {
      lotExistantId = vivaces[0].id;
      // Couverture partielle : on réduit le besoin (heuristique : 50 % du stock virtuel vivace)
      const couverture = besoinNet * 0.5;
      besoinNet = Math.max(0, besoinNet - couverture);
    }

    const rendementHa =
      espece.rendementKgHaSec ??
      (params as { rendementDefautKgHaSec?: number }).rendementDefautKgHaSec ??
      500;
    const rendementKgM2 = rendementHa / 10_000;

    if (besoinNet <= 0) {
      lignesData.push({
        especeId: agg.especeId,
        matiereId: agg.matiereId,
        priorite: agg.priorite,
        besoinKgBrut: agg.besoinKgBrut,
        stockKg,
        besoinKgNet: 0,
        surfaceM2Calculee: 0,
        surfaceM2: 0,
        faisabilite: 'vert',
        besoinEau: espece.besoinEau,
        lotCultureExistantId: lotExistantId,
        motif: 'couvert_stock_ou_vivace',
      });
      continue;
    }

    if (!rendementKgM2 || rendementKgM2 <= 0) {
      lignesData.push({
        especeId: agg.especeId,
        matiereId: agg.matiereId,
        priorite: agg.priorite,
        besoinKgBrut: agg.besoinKgBrut,
        stockKg,
        besoinKgNet: besoinNet,
        faisabilite: 'non_place',
        besoinEau: espece.besoinEau,
        motif: 'rendement_manquant',
      });
      continue;
    }

    let surfaceRestante = besoinNet / rendementKgM2;
    const surfaceCalculee = surfaceRestante;

    const candidates = planches
      .map((p) => {
        const f = espece.faisabilites.find((x) => x.vocation === p.parcelle.vocation);
        const niveau = f?.niveau;
        return {
          planche: p,
          niveau,
          faisabilite: mapFaisabilite(niveau),
          free: free.get(p.id) ?? 0,
        };
      })
      .filter((c) => c.faisabilite !== 'rouge' && c.free > 0)
      .sort((a, b) => {
        const order = { vert: 0, jaune: 1, rouge: 2, non_place: 3 };
        const fo = order[a.faisabilite] - order[b.faisabilite];
        if (fo !== 0) return fo;
        return b.free - a.free;
      });

    let placed = false;
    for (const c of candidates) {
      if (surfaceRestante <= 0) break;
      const take = Math.min(c.free, surfaceRestante);
      if (take <= 0) continue;
      free.set(c.planche.id, c.free - take);
      surfaceRestante -= take;
      const eauL =
        espece.besoinEauLMois != null ? espece.besoinEauLMois * (take / 100) : undefined;
      lignesData.push({
        especeId: agg.especeId,
        matiereId: agg.matiereId,
        priorite: agg.priorite,
        besoinKgBrut: agg.besoinKgBrut,
        stockKg,
        besoinKgNet: besoinNet,
        surfaceM2Calculee: surfaceCalculee,
        surfaceM2: take,
        plancheId: c.planche.id,
        faisabilite: c.faisabilite,
        besoinEau: espece.besoinEau,
        eauLEstime: eauL,
        lotCultureExistantId: lotExistantId,
      });
      placed = true;
    }

    if (surfaceRestante > 0.01) {
      lignesData.push({
        especeId: agg.especeId,
        matiereId: agg.matiereId,
        priorite: agg.priorite,
        besoinKgBrut: agg.besoinKgBrut,
        stockKg,
        besoinKgNet: besoinNet,
        surfaceM2Calculee: surfaceCalculee,
        surfaceM2: surfaceRestante,
        faisabilite: 'non_place',
        besoinEau: espece.besoinEau,
        motif: placed ? 'surface_insuffisante' : 'aucune_planche',
        lotCultureExistantId: lotExistantId,
      });
    }
  }

  const prop = await prisma.propositionPlan.create({
    data: {
      annee: input.annee,
      version,
      statut: 'active',
      inclureCommandes,
      parametres: input.parametres as Prisma.InputJsonValue | undefined,
      notes: input.notes,
      lignes: { create: lignesData },
    },
    include: {
      lignes: {
        include: {
          espece: true,
          planche: true,
        },
      },
    },
  });

  const nbNonPlace = prop.lignes.filter((l) => l.faisabilite === 'non_place').length;
  await emit('planification.proposee', {
    id: prop.id,
    annee: prop.annee,
    version: prop.version,
    nb_lignes: prop.lignes.length,
    nb_non_place: nbNonPlace,
  });
  return prop;
}

export async function listPropositions(annee?: number) {
  return prisma.propositionPlan.findMany({
    where: annee ? { annee } : undefined,
    orderBy: [{ annee: 'desc' }, { version: 'desc' }],
    include: { _count: { select: { lignes: true } } },
  });
}

export async function getProposition(id: number) {
  const p = await prisma.propositionPlan.findUnique({
    where: { id },
    include: {
      lignes: {
        include: {
          espece: true,
          planche: { include: { parcelle: true } },
        },
        orderBy: [{ priorite: 'asc' }, { id: 'asc' }],
      },
    },
  });
  if (!p) throw new AppError('not_found', `Proposition ${id} introuvable`, 404);
  return p;
}

export async function archiveProposition(id: number) {
  await getProposition(id);
  return prisma.propositionPlan.update({
    where: { id },
    data: { statut: 'archivee' },
  });
}

export async function patchLigne(
  propositionId: number,
  ligneId: number,
  input: {
    surfaceM2?: number;
    plancheId?: number | null;
    notes?: string | null;
  },
) {
  const prop = await getProposition(propositionId);
  if (prop.statut === 'appliquee' || prop.statut === 'archivee') {
    throw new AppError('conflict', 'Proposition non éditable', 409);
  }
  const ligne = prop.lignes.find((l) => l.id === ligneId);
  if (!ligne) throw new AppError('not_found', `Ligne ${ligneId} introuvable`, 404);

  let faisabilite = ligne.faisabilite;
  if (input.plancheId != null && ligne.especeId) {
    const planche = await prisma.planche.findUnique({
      where: { id: input.plancheId },
      include: { parcelle: true },
    });
    if (!planche) throw new AppError('not_found', 'Planche introuvable', 404);
    const f = await prisma.faisabilite.findUnique({
      where: {
        especeId_vocation: {
          especeId: ligne.especeId,
          vocation: planche.parcelle.vocation,
        },
      },
    });
    faisabilite = mapFaisabilite(f?.niveau);
  }

  return prisma.propositionLigne.update({
    where: { id: ligneId },
    data: {
      surfaceM2: input.surfaceM2,
      plancheId: input.plancheId === null ? null : input.plancheId,
      notes: input.notes,
      manuelle: true,
      faisabilite:
        input.plancheId === null
          ? 'non_place'
          : input.plancheId != null
            ? faisabilite
            : undefined,
    },
  });
}

export async function recalculerProposition(
  id: number,
  opts: { forcerManuelles?: boolean } = {},
) {
  const prop = await getProposition(id);
  if (prop.statut === 'appliquee') {
    throw new AppError('conflict', 'Proposition déjà appliquée', 409);
  }
  const manuelles = opts.forcerManuelles
    ? []
    : prop.lignes.filter((l) => l.manuelle);

  await prisma.propositionLigne.deleteMany({
    where: {
      propositionId: id,
      ...(manuelles.length
        ? { id: { notIn: manuelles.map((m) => m.id) } }
        : {}),
    },
  });

  // Régénère en créant une nouvelle version et copie manuelles — simplifié V1 :
  // on archive et on régénère, puis on réapplique les patches manuels
  const nouvelle = await genererProposition({
    annee: prop.annee,
    inclureCommandes: prop.inclureCommandes,
    parametres: (prop.parametres as { ignorerStock?: boolean; filtreEau?: string }) ?? undefined,
    notes: prop.notes ?? undefined,
  });

  for (const m of manuelles) {
    if (m.plancheId != null || m.surfaceM2 != null) {
      // Cherche ligne même espèce sans planche ou première
      const cible = nouvelle.lignes.find(
        (l) => l.especeId === m.especeId && l.faisabilite !== 'non_place',
      ) ?? nouvelle.lignes.find((l) => l.especeId === m.especeId);
      if (cible) {
        await patchLigne(nouvelle.id, cible.id, {
          surfaceM2: m.surfaceM2 ?? undefined,
          plancheId: m.plancheId,
          notes: m.notes,
        });
      }
    }
  }

  await prisma.propositionPlan.update({
    where: { id: prop.id },
    data: { statut: 'archivee' },
  });

  return getProposition(nouvelle.id);
}

export async function appliquerProposition(
  id: number,
  input: { dateDebut?: string } = {},
) {
  const prop = await getProposition(id);
  if (prop.statut === 'appliquee') {
    throw new AppError('conflict', 'Proposition déjà appliquée', 409);
  }
  if (prop.statut === 'archivee') {
    throw new AppError('conflict', 'Proposition archivée', 409);
  }

  const lotIds: number[] = [];
  for (const l of prop.lignes) {
    if (!l.especeId || !l.plancheId || !l.surfaceM2 || l.surfaceM2 <= 0) continue;
    if (l.faisabilite === 'non_place' || l.faisabilite === 'rouge') continue;

    const dispo = await surfaceDisponiblePlanche(l.plancheId, prop.annee);
    if (l.surfaceM2 > dispo + 0.01) {
      throw new AppError('conflict', 'Surface planche insuffisante à l’application', 409, {
        ligneId: l.id,
        demande: l.surfaceM2,
        disponible: dispo,
      });
    }

    const lot = await createLot({
      especeId: l.especeId,
      plancheId: l.plancheId,
      annee: prop.annee,
      surfaceM2: l.surfaceM2,
      priorite: l.priorite,
      notes: `Planif #${prop.id} v${prop.version}`,
      dateDebut: input.dateDebut,
    });
    await prisma.propositionLigne.update({
      where: { id: l.id },
      data: { lotCultureCreeId: lot.id },
    });
    lotIds.push(lot.id);
  }

  const updated = await prisma.propositionPlan.update({
    where: { id },
    data: { statut: 'appliquee' },
    include: { lignes: true },
  });

  await emit('planification.appliquee', {
    id: updated.id,
    lot_culture_ids: lotIds,
  });
  return { ...updated, lotCultureIds: lotIds };
}

export async function couvertureProposition(id: number) {
  const prop = await getProposition(id);
  const params = await getParametres();
  const rows = [];

  for (const l of prop.lignes) {
    if (!l.especeId) continue;
    const espece = await prisma.espece.findUniqueOrThrow({ where: { id: l.especeId } });
    const rendementHa =
      espece.rendementKgHaSec ??
      (params as { rendementDefautKgHaSec?: number }).rendementDefautKgHaSec ??
      500;
    const rendementKgM2 = rendementHa / 10_000;
    const planifieKg = (l.surfaceM2 ?? 0) * rendementKgM2;
    const ecart = planifieKg + l.stockKg - l.besoinKgBrut;
    let statut: 'ok' | 'manque' | 'surplus' = 'ok';
    if (ecart < -0.01) statut = 'manque';
    else if (ecart > 0.01) statut = 'surplus';
    rows.push({
      ligneId: l.id,
      especeId: l.especeId,
      besoinKgBrut: l.besoinKgBrut,
      besoinKgNet: l.besoinKgNet,
      stockKg: l.stockKg,
      planifieKg,
      ecart,
      statut,
    });
  }
  return rows;
}
