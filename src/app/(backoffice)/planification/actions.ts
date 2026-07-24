'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { AppError } from '@/lib/errors';
import type { FormState } from '@/lib/form-state';
import {
  genererProposition,
  appliquerProposition,
  recalculerProposition,
  archiveProposition,
  patchLigne,
} from '@/services/planification';

function formError(e: unknown): FormState {
  if (e instanceof AppError) return { ok: false, message: e.message };
  if (e instanceof Error) return { ok: false, message: e.message };
  return { ok: false, message: 'Erreur inconnue' };
}

function isRedirect(e: unknown): boolean {
  return typeof e === 'object' && e !== null && 'digest' in e;
}

export async function actionGenererProposition(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const p = await genererProposition({
      annee: Number(formData.get('annee')),
      inclureCommandes: formData.get('inclureCommandes') === 'on',
      notes: String(formData.get('notes') || '') || undefined,
      parametres: {
        ignorerStock: formData.get('ignorerStock') === 'on',
      },
    });
    revalidatePath('/planification/propositions');
    redirect(`/planification/propositions/${p.id}`);
  } catch (e) {
    if (isRedirect(e)) throw e;
    return formError(e);
  }
}

export async function actionAppliquerProposition(id: number, dateDebut?: string) {
  try {
    await appliquerProposition(id, { dateDebut: dateDebut || undefined });
    revalidatePath(`/planification/propositions/${id}`);
    revalidatePath('/planification/propositions');
    revalidatePath('/culture/lots');
  } catch (e) {
    throw new Error(e instanceof AppError ? e.message : 'Application impossible');
  }
}

export async function actionRecalculerProposition(id: number) {
  try {
    const p = await recalculerProposition(id);
    revalidatePath(`/planification/propositions/${id}`);
    revalidatePath(`/planification/propositions/${p.id}`);
    return p.id;
  } catch (e) {
    throw new Error(e instanceof AppError ? e.message : 'Recalcul impossible');
  }
}

export async function actionArchiverProposition(id: number) {
  try {
    await archiveProposition(id);
    revalidatePath(`/planification/propositions/${id}`);
    revalidatePath('/planification/propositions');
  } catch (e) {
    throw new Error(e instanceof AppError ? e.message : 'Archivage impossible');
  }
}

export async function actionPatchLigne(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const propositionId = Number(formData.get('propositionId'));
    const ligneId = Number(formData.get('ligneId'));
    const plancheRaw = String(formData.get('plancheId') || '');
    await patchLigne(propositionId, ligneId, {
      surfaceM2: formData.get('surfaceM2')
        ? Number(formData.get('surfaceM2'))
        : undefined,
      plancheId: plancheRaw === '' ? null : Number(plancheRaw),
      notes: String(formData.get('notes') || '') || null,
    });
    revalidatePath(`/planification/propositions/${propositionId}`);
    return { ok: true };
  } catch (e) {
    return formError(e);
  }
}
