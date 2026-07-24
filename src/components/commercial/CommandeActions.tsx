'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import {
  actionAnnulerCommande,
  actionConfirmerCommande,
  actionLivrerCommande,
  actionPreparerCommande,
} from '@/app/(backoffice)/commercial/actions';

export function CommandeActions({
  id,
  statut,
}: {
  id: number;
  statut: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(fn: () => Promise<void>) {
    setError(null);
    start(async () => {
      try {
        await fn();
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Action impossible');
      }
    });
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-theme border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {statut === 'brouillon' && (
          <button
            type="button"
            className="btn-primary"
            disabled={pending}
            onClick={() => run(() => actionConfirmerCommande(id))}
          >
            Confirmer
          </button>
        )}
        {statut === 'confirmee' && (
          <button
            type="button"
            className="btn-primary"
            disabled={pending}
            onClick={() => run(() => actionPreparerCommande(id))}
          >
            Préparer
          </button>
        )}
        {(statut === 'confirmee' || statut === 'preparee') && (
          <button
            type="button"
            className="btn-primary"
            disabled={pending}
            onClick={() => run(() => actionLivrerCommande(id))}
          >
            Livrer (déstockage)
          </button>
        )}
        {!['livree', 'annulee'].includes(statut) && (
          <button
            type="button"
            className="btn-ghost text-red-700"
            disabled={pending}
            onClick={() => run(() => actionAnnulerCommande(id))}
          >
            Annuler
          </button>
        )}
      </div>
    </div>
  );
}
