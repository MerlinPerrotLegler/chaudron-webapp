'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { AppError } from '@/lib/errors';
import type { FormState } from '@/lib/form-state';
import type { TypeClient, TypePointVente } from '@prisma/client';
import {
  createClient,
  updateClient,
  archiveClient,
  addClientNote,
} from '@/services/client';
import {
  createPointVente,
  updatePointVente,
  archivePointVente,
  addDateLivraison,
} from '@/services/pointVente';
import {
  createCommande,
  confirmerCommande,
  preparerCommande,
  livrerCommande,
  annulerCommande,
} from '@/services/commande';

function formError(e: unknown): FormState {
  if (e instanceof AppError) return { ok: false, message: e.message };
  if (e instanceof Error) return { ok: false, message: e.message };
  return { ok: false, message: 'Erreur inconnue' };
}

function isRedirect(e: unknown): boolean {
  return typeof e === 'object' && e !== null && 'digest' in e;
}

export async function actionCreateClient(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const typeRaw = String(formData.get('type') || '');
    const c = await createClient({
      nom: String(formData.get('nom') ?? '').trim(),
      type: typeRaw ? (typeRaw as TypeClient) : undefined,
      contactNom: String(formData.get('contactNom') || '') || undefined,
      email: String(formData.get('email') || '') || undefined,
      telephone: String(formData.get('telephone') || '') || undefined,
      ville: String(formData.get('ville') || '') || undefined,
      notes: String(formData.get('notes') || '') || undefined,
    });
    revalidatePath('/commercial/clients');
    redirect(`/commercial/clients/${c.id}`);
  } catch (e) {
    if (isRedirect(e)) throw e;
    return formError(e);
  }
}

export async function actionUpdateClient(
  id: number,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const typeRaw = String(formData.get('type') || '');
    await updateClient(id, {
      nom: String(formData.get('nom') ?? '').trim(),
      type: typeRaw ? (typeRaw as TypeClient) : null,
      contactNom: String(formData.get('contactNom') || '') || null,
      email: String(formData.get('email') || '') || null,
      telephone: String(formData.get('telephone') || '') || null,
      ville: String(formData.get('ville') || '') || null,
      notes: String(formData.get('notes') || '') || null,
    });
    revalidatePath(`/commercial/clients/${id}`);
    revalidatePath('/commercial/clients');
    return { ok: true };
  } catch (e) {
    return formError(e);
  }
}

export async function actionArchiveClient(id: number) {
  try {
    await archiveClient(id);
    revalidatePath('/commercial/clients');
    redirect('/commercial/clients');
  } catch (e) {
    if (isRedirect(e)) throw e;
    throw e;
  }
}

export async function actionAddClientNote(
  clientId: number,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    await addClientNote(clientId, {
      date: String(formData.get('date') || new Date().toISOString().slice(0, 10)),
      texte: String(formData.get('texte') ?? '').trim(),
      operateurNom: String(formData.get('operateurNom') || '') || undefined,
    });
    revalidatePath(`/commercial/clients/${clientId}`);
    return { ok: true };
  } catch (e) {
    return formError(e);
  }
}

export async function actionCreatePointVente(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const p = await createPointVente({
      nom: String(formData.get('nom') ?? '').trim(),
      type: String(formData.get('type') || 'autre') as TypePointVente,
      contact: String(formData.get('contact') || '') || undefined,
      notes: String(formData.get('notes') || '') || undefined,
    });
    revalidatePath('/commercial/points-vente');
    redirect(`/commercial/points-vente/${p.id}`);
  } catch (e) {
    if (isRedirect(e)) throw e;
    return formError(e);
  }
}

export async function actionUpdatePointVente(
  id: number,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    await updatePointVente(id, {
      nom: String(formData.get('nom') ?? '').trim(),
      type: String(formData.get('type') || 'autre') as TypePointVente,
      contact: String(formData.get('contact') || '') || null,
      notes: String(formData.get('notes') || '') || null,
    });
    revalidatePath(`/commercial/points-vente/${id}`);
    revalidatePath('/commercial/points-vente');
    return { ok: true };
  } catch (e) {
    return formError(e);
  }
}

export async function actionArchivePointVente(id: number) {
  await archivePointVente(id);
  revalidatePath('/commercial/points-vente');
  redirect('/commercial/points-vente');
}

export async function actionAddDateLivraison(
  pointVenteId: number,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    await addDateLivraison(pointVenteId, {
      date: String(formData.get('date')),
      notes: String(formData.get('notes') || '') || undefined,
    });
    revalidatePath(`/commercial/points-vente/${pointVenteId}`);
    return { ok: true };
  } catch (e) {
    return formError(e);
  }
}

export async function actionCreateCommande(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const produitFiniId = Number(formData.get('produitFiniId'));
    const quantite = Number(formData.get('quantite'));
    const prixRaw = String(formData.get('prixUnitaire') || '');
    const cmd = await createCommande({
      clientId: Number(formData.get('clientId')),
      pointVenteId: Number(formData.get('pointVenteId')),
      dateCommande: String(formData.get('dateCommande')),
      dateLivraison: String(formData.get('dateLivraison')),
      reference: String(formData.get('reference') || '') || undefined,
      notes: String(formData.get('notes') || '') || undefined,
      lignes: [
        {
          produitFiniId,
          quantite,
          prixUnitaire: prixRaw ? Number(prixRaw) : undefined,
        },
      ],
    });
    revalidatePath('/commercial/commandes');
    redirect(`/commercial/commandes/${cmd.id}`);
  } catch (e) {
    if (isRedirect(e)) throw e;
    return formError(e);
  }
}

export async function actionConfirmerCommande(id: number) {
  try {
    await confirmerCommande(id);
    revalidatePath(`/commercial/commandes/${id}`);
    revalidatePath('/commercial/commandes');
  } catch (e) {
    throw new Error(e instanceof AppError ? e.message : 'Confirmation impossible');
  }
}

export async function actionPreparerCommande(id: number) {
  try {
    await preparerCommande(id);
    revalidatePath(`/commercial/commandes/${id}`);
    revalidatePath('/commercial/commandes');
  } catch (e) {
    throw new Error(e instanceof AppError ? e.message : 'Préparation impossible');
  }
}

export async function actionLivrerCommande(id: number) {
  try {
    await livrerCommande(id);
    revalidatePath(`/commercial/commandes/${id}`);
    revalidatePath('/commercial/commandes');
    revalidatePath('/commercial/ventes');
  } catch (e) {
    throw new Error(e instanceof AppError ? e.message : 'Livraison impossible');
  }
}

export async function actionAnnulerCommande(id: number) {
  try {
    await annulerCommande(id);
    revalidatePath(`/commercial/commandes/${id}`);
    revalidatePath('/commercial/commandes');
  } catch (e) {
    throw new Error(e instanceof AppError ? e.message : 'Annulation impossible');
  }
}
