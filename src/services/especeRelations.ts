import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import { getEspece } from './espece';
import {
  associationSchema,
  risqueSchema,
  faisabiliteSchema,
  type ItineraireEtapeInput,
} from '@/lib/validation/espece';
import type { z } from 'zod';

export async function addItineraireEtape(especeId: number, input: ItineraireEtapeInput) {
  await getEspece(especeId);
  return prisma.itineraireEtape.create({
    data: {
      especeId,
      ordre: input.ordre ?? 0,
      code: input.code,
      libelle: input.libelle,
      dureeDepuisPrecedenteJours: input.dureeDepuisPrecedenteJours ?? 0,
      fenetreDebutMmdd: input.fenetreDebutMmdd,
      fenetreFinMmdd: input.fenetreFinMmdd,
      description: input.description,
    },
  });
}

export async function updateItineraireEtape(
  especeId: number,
  etapeId: number,
  input: Partial<ItineraireEtapeInput>,
) {
  await getEspece(especeId);
  const e = await prisma.itineraireEtape.findFirst({ where: { id: etapeId, especeId } });
  if (!e) throw new AppError('not_found', `Étape itinéraire ${etapeId} introuvable`, 404);
  return prisma.itineraireEtape.update({ where: { id: etapeId }, data: input });
}

export async function removeItineraireEtape(especeId: number, etapeId: number) {
  await getEspece(especeId);
  const e = await prisma.itineraireEtape.findFirst({ where: { id: etapeId, especeId } });
  if (!e) throw new AppError('not_found', `Étape itinéraire ${etapeId} introuvable`, 404);
  await prisma.itineraireEtape.delete({ where: { id: etapeId } });
}

export async function addAssociation(
  especeId: number,
  input: z.infer<typeof associationSchema>,
) {
  await getEspece(especeId);
  await getEspece(input.especeCibleId);
  return prisma.association.create({
    data: {
      especeId,
      especeCibleId: input.especeCibleId,
      type: input.type,
      notes: input.notes,
    },
  });
}

export async function addRisque(especeId: number, input: z.infer<typeof risqueSchema>) {
  await getEspece(especeId);
  return prisma.risqueCulture.create({
    data: {
      especeId,
      nom: input.nom,
      description: input.description,
      prevention: input.prevention,
    },
  });
}

export async function upsertFaisabilite(
  especeId: number,
  input: z.infer<typeof faisabiliteSchema>,
) {
  await getEspece(especeId);
  return prisma.faisabilite.upsert({
    where: {
      especeId_vocation: { especeId, vocation: input.vocation },
    },
    create: {
      especeId,
      vocation: input.vocation,
      niveau: input.niveau,
      notes: input.notes,
    },
    update: { niveau: input.niveau, notes: input.notes },
  });
}
