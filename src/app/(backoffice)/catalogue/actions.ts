'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { AppError } from '@/lib/errors';
import type { FormState } from '@/lib/form-state';
import { createMatiere, updateMatiere, archiveMatiere } from '@/services/matiere';
import { createRecette, archiveRecette } from '@/services/recette';
import { createProduit } from '@/services/produit';
import { createConditionnement } from '@/services/conditionnement';
import type { MatiereCreateInput, MatiereUpdateInput } from '@/lib/validation/matiere';
import type { RecetteCreateInput } from '@/lib/validation/recette';
import type { ProduitCreateInput } from '@/lib/validation/produit';

function formError(e: unknown): FormState {
  if (e instanceof AppError) return { ok: false, message: e.message };
  if (e instanceof Error) return { ok: false, message: e.message };
  return { ok: false, message: 'Erreur inconnue' };
}

function isRedirect(e: unknown): boolean {
  return typeof e === 'object' && e !== null && 'digest' in e;
}

export async function actionCreateMatiere(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const provenance = String(
      formData.get('provenance') ?? 'base',
    ) as MatiereCreateInput['provenance'];
    const especeRaw = String(formData.get('especeId') || '');
    const input: MatiereCreateInput = {
      nom: String(formData.get('nom') ?? '').trim(),
      provenance,
      uniteAchat: String(formData.get('uniteAchat') || 'kg') as 'kg' | 'L' | 'piece',
      nomLatin: String(formData.get('nomLatin') || '') || undefined,
      fournisseur: String(formData.get('fournisseur') || '') || undefined,
      especeId: especeRaw ? Number(especeRaw) : undefined,
    };
    const m = await createMatiere(input);
    revalidatePath('/catalogue/matieres');
    redirect(`/catalogue/matieres/${m.id}`);
  } catch (e) {
    if (isRedirect(e)) throw e;
    return formError(e);
  }
}

export async function actionUpdateMatiere(
  id: number,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const input: MatiereUpdateInput = {
      nom: String(formData.get('nom') ?? '').trim(),
      provenance: String(formData.get('provenance')) as MatiereUpdateInput['provenance'],
      uniteAchat: String(formData.get('uniteAchat') || 'kg') as MatiereUpdateInput['uniteAchat'],
      nomLatin: String(formData.get('nomLatin') || '') || undefined,
      fournisseur: String(formData.get('fournisseur') || '') || undefined,
    };
    await updateMatiere(id, input);
    revalidatePath(`/catalogue/matieres/${id}`);
    revalidatePath('/catalogue/matieres');
    return { ok: true };
  } catch (e) {
    return formError(e);
  }
}

export async function actionArchiveMatiere(id: number) {
  try {
    await archiveMatiere(id);
    revalidatePath('/catalogue/matieres');
    redirect('/catalogue/matieres');
  } catch (e) {
    if (isRedirect(e)) throw e;
    throw e;
  }
}

export async function actionCreateRecette(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const input: RecetteCreateInput = {
      nom: String(formData.get('nom') ?? '').trim(),
      famille: String(formData.get('famille') ?? 'autre') as RecetteCreateInput['famille'],
      type: String(formData.get('type') || 'transformation') as 'transformation' | 'simple',
      modeQuantite: String(formData.get('modeQuantite') || 'absolu') as
        | 'proportions'
        | 'absolu',
      quantiteSortie: formData.get('quantiteSortie')
        ? Number(formData.get('quantiteSortie'))
        : undefined,
      uniteSortie: String(formData.get('uniteSortie') || '') || undefined,
      description: String(formData.get('description') || '') || undefined,
    };
    const r = await createRecette(input);
    revalidatePath('/catalogue/recettes');
    redirect(`/catalogue/recettes/${r.id}`);
  } catch (e) {
    if (isRedirect(e)) throw e;
    return formError(e);
  }
}

export async function actionArchiveRecette(id: number) {
  await archiveRecette(id);
  revalidatePath('/catalogue/recettes');
  redirect('/catalogue/recettes');
}

export async function actionCreateProduit(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const input: ProduitCreateInput = {
      recetteId: Number(formData.get('recetteId')),
      conditionnementId: Number(formData.get('conditionnementId')),
      poidsUnite: Number(formData.get('poidsUnite')),
      prixVenteUnite: formData.get('prixVenteUnite')
        ? Number(formData.get('prixVenteUnite'))
        : undefined,
    };
    await createProduit(input);
    revalidatePath('/catalogue/produits');
    redirect('/catalogue/produits');
  } catch (e) {
    if (isRedirect(e)) throw e;
    return formError(e);
  }
}

export async function actionCreateConditionnement(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    await createConditionnement({
      nom: String(formData.get('nom') ?? '').trim(),
      coutTotal: Number(formData.get('coutTotal') || 0),
    });
    revalidatePath('/catalogue/conditionnements');
    redirect('/catalogue/conditionnements');
  } catch (e) {
    if (isRedirect(e)) throw e;
    return formError(e);
  }
}
