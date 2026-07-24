'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { actionTerminerProduction } from '@/app/(backoffice)/production/actions';

export function ProductionActions({
  id,
  statut,
}: {
  id: number;
  statut: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (statut === 'terminee' || statut === 'annulee') {
    return <p className="text-sm text-ink/50">Aucune action disponible.</p>;
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-theme border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}
      <button
        type="button"
        className="btn-primary"
        disabled={pending}
        onClick={() => {
          setError(null);
          start(async () => {
            try {
              await actionTerminerProduction(id);
              router.refresh();
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Action impossible');
            }
          });
        }}
      >
        Terminer (sortie stock + entrée produits)
      </button>
    </div>
  );
}
