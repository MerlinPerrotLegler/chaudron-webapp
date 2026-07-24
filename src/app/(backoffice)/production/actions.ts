'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { AppError } from '@/lib/errors';
import type { FormState } from '@/lib/form-state';
import { declareTransformation } from '@/services/transformation';
import { createProduction, terminerProduction } from '@/services/production';
import { createEquipement } from '@/services/equipement';

function formError(e: unknown): FormState {
  if (e instanceof AppError) return { ok: false, message: e.message };
  if (e instanceof Error) return { ok: false, message: e.message };
  return { ok: false, message: 'Erreur inconnue' };
}

function isRedirect(e: unknown): boolean {
  return typeof e === 'object' && e !== null && 'digest' in e;
}

export async function actionDeclareTransformation(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const type = String(formData.get('type') || 'sechage') as
      | 'sechage'
      | 'distillation'
      | 'mondage'
      | 'congelation'
      | 'torrefaction'
      | 'autre';
    const t = await declareTransformation({
      type,
      typeLibelle: String(formData.get('typeLibelle') || '') || undefined,
      date: String(formData.get('date')),
      matiereOutId: Number(formData.get('matiereOutId')),
      quantiteOut: Number(formData.get('quantiteOut')),
      lignesIn: [
        {
          matiereId: Number(formData.get('matiereInId')),
          quantite: Number(formData.get('quantiteIn')),
        },
      ],
      emplacementOutId: formData.get('emplacementOutId')
        ? Number(formData.get('emplacementOutId'))
        : undefined,
      datePeremptionOut: String(formData.get('datePeremptionOut') || '') || undefined,
      operateurNom: String(formData.get('operateurNom') || '') || undefined,
      notes: String(formData.get('notes') || '') || undefined,
    });
    revalidatePath('/production/transformations');
    revalidatePath('/stock/matieres');
    redirect(`/production/transformations/${t.id}`);
  } catch (e) {
    if (isRedirect(e)) throw e;
    return formError(e);
  }
}

export async function actionCreateProduction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const p = await createProduction({
      recetteId: Number(formData.get('recetteId')),
      date: String(formData.get('date')),
      numeroLot: String(formData.get('numeroLot') ?? '').trim(),
      facteurEchelle: formData.get('facteurEchelle')
        ? Number(formData.get('facteurEchelle'))
        : undefined,
      sorties: [
        {
          produitFiniId: Number(formData.get('produitFiniId')),
          quantiteUnites: Number(formData.get('quantiteUnites')),
          emplacementId: formData.get('emplacementId')
            ? Number(formData.get('emplacementId'))
            : undefined,
          datePeremption: String(formData.get('datePeremption') || '') || undefined,
        },
      ],
      operateurNom: String(formData.get('operateurNom') || '') || undefined,
      notes: String(formData.get('notes') || '') || undefined,
    });
    revalidatePath('/production/lots');
    redirect(`/production/lots/${p.id}`);
  } catch (e) {
    if (isRedirect(e)) throw e;
    return formError(e);
  }
}

export async function actionTerminerProduction(id: number) {
  try {
    await terminerProduction(id);
    revalidatePath(`/production/lots/${id}`);
    revalidatePath('/production/lots');
    revalidatePath('/stock/produits');
    revalidatePath('/stock/matieres');
  } catch (e) {
    throw new Error(e instanceof AppError ? e.message : 'Terminaison impossible');
  }
}

export async function actionCreateEquipement(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    await createEquipement({
      nom: String(formData.get('nom') ?? '').trim(),
    });
    revalidatePath('/production/equipements');
    redirect('/production/equipements');
  } catch (e) {
    if (isRedirect(e)) throw e;
    return formError(e);
  }
}
