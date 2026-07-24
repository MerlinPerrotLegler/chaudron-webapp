'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { VocationParcelle } from '@prisma/client';
import { AppError } from '@/lib/errors';
import type { FormState } from '@/lib/form-state';
import { createParcelle } from '@/services/parcelle';
import { createPlanche } from '@/services/planche';
import { createEspece } from '@/services/espece';
import { createLot } from '@/services/lotCulture';
import { declareRecolte } from '@/services/recolte';
import type { EspeceCreateInput } from '@/lib/validation/espece';
import type { LotCreateInput } from '@/lib/validation/lot';

function formError(e: unknown): FormState {
  if (e instanceof AppError) return { ok: false, message: e.message };
  if (e instanceof Error) return { ok: false, message: e.message };
  return { ok: false, message: 'Erreur inconnue' };
}

function isRedirect(e: unknown): boolean {
  return typeof e === 'object' && e !== null && 'digest' in e;
}

export async function actionCreateParcelle(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const p = await createParcelle({
      code: String(formData.get('code') ?? '').trim().toUpperCase(),
      vocation: String(formData.get('vocation') || 'autre') as VocationParcelle,
      surfaceM2: formData.get('surfaceM2')
        ? Number(formData.get('surfaceM2'))
        : undefined,
    });
    revalidatePath('/culture/parcelles');
    redirect(`/culture/parcelles/${p.id}`);
  } catch (e) {
    if (isRedirect(e)) throw e;
    return formError(e);
  }
}

export async function actionCreatePlanche(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const pl = await createPlanche({
      parcelleId: Number(formData.get('parcelleId')),
      numero: String(formData.get('numero') ?? '').trim(),
      surfaceM2: Number(formData.get('surfaceM2')),
      particularites: String(formData.get('particularites') || '') || undefined,
    });
    revalidatePath('/culture/planches');
    revalidatePath(`/culture/parcelles/${pl.parcelleId}`);
    redirect(`/culture/planches/${pl.id}`);
  } catch (e) {
    if (isRedirect(e)) throw e;
    return formError(e);
  }
}

export async function actionCreateEspece(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const cycle = String(formData.get('cycle') || '');
    const besoinEau = String(formData.get('besoinEau') || '');
    const input: EspeceCreateInput = {
      nom: String(formData.get('nom') ?? '').trim(),
      nomLatin: String(formData.get('nomLatin') || '') || undefined,
      cycle: cycle
        ? (cycle as EspeceCreateInput['cycle'])
        : undefined,
      besoinEau: besoinEau
        ? (besoinEau as EspeceCreateInput['besoinEau'])
        : undefined,
      rendementKgHaSec: formData.get('rendementKgHaSec')
        ? Number(formData.get('rendementKgHaSec'))
        : undefined,
    };
    const e = await createEspece(input);
    revalidatePath('/culture/especes');
    redirect(`/culture/especes/${e.id}`);
  } catch (e) {
    if (isRedirect(e)) throw e;
    return formError(e);
  }
}

export async function actionCreateLot(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const priorite = String(formData.get('priorite') || 'P2') as LotCreateInput['priorite'];
    const input: LotCreateInput = {
      especeId: Number(formData.get('especeId')),
      plancheId: Number(formData.get('plancheId')),
      annee: Number(formData.get('annee')),
      surfaceM2: Number(formData.get('surfaceM2')),
      priorite,
      notes: String(formData.get('notes') || '') || undefined,
      dateDebut: String(formData.get('dateDebut') || '') || undefined,
    };
    const lot = await createLot(input);
    revalidatePath('/culture/lots');
    redirect(`/culture/lots/${lot.id}`);
  } catch (e) {
    if (isRedirect(e)) throw e;
    return formError(e);
  }
}

export async function actionDeclareRecolte(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    await declareRecolte({
      lotId: Number(formData.get('lotId')),
      date: String(formData.get('date')),
      poidsKg: Number(formData.get('poidsKg')),
      matiereId: Number(formData.get('matiereId')),
      qualite: (String(formData.get('qualite') || 'A') as 'A' | 'B' | 'C' | 'autre'),
      notes: String(formData.get('notes') || '') || undefined,
    });
    revalidatePath('/culture/recoltes');
    revalidatePath('/stock/matieres');
    redirect('/culture/recoltes');
  } catch (e) {
    if (isRedirect(e)) throw e;
    return formError(e);
  }
}
