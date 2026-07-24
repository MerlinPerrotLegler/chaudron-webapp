'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { AppError } from '@/lib/errors';
import type { FormState } from '@/lib/form-state';
import { createEmplacement, declareAchat } from '@/services/stock';

function formError(e: unknown): FormState {
  if (e instanceof AppError) return { ok: false, message: e.message };
  if (e instanceof Error) return { ok: false, message: e.message };
  return { ok: false, message: 'Erreur inconnue' };
}

function isRedirect(e: unknown): boolean {
  return typeof e === 'object' && e !== null && 'digest' in e;
}

export async function actionCreateEmplacement(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    await createEmplacement({
      nom: String(formData.get('nom') ?? '').trim(),
      notes: String(formData.get('notes') || '') || undefined,
    });
    revalidatePath('/stock/emplacements');
    redirect('/stock/emplacements');
  } catch (e) {
    if (isRedirect(e)) throw e;
    return formError(e);
  }
}

export async function actionDeclareAchat(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const emp = String(formData.get('emplacementId') || '');
    const dluo = String(formData.get('datePeremption') || '');
    await declareAchat({
      matiereId: Number(formData.get('matiereId')),
      date: String(formData.get('date')),
      quantite: Number(formData.get('quantite')),
      prixUnitaire: Number(formData.get('prixUnitaire')),
      fournisseur: String(formData.get('fournisseur') || '') || undefined,
      emplacementId: emp ? Number(emp) : undefined,
      datePeremption: dluo || undefined,
      ajouterPrixCatalogue: formData.get('ajouterPrixCatalogue') === 'on',
    });
    revalidatePath('/stock/achats');
    revalidatePath('/stock/matieres');
    revalidatePath('/stock/alertes');
    redirect('/stock/achats');
  } catch (e) {
    if (isRedirect(e)) throw e;
    return formError(e);
  }
}
