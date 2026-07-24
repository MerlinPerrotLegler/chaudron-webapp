'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import {
  actionAppliquerProposition,
  actionArchiverProposition,
  actionRecalculerProposition,
} from '@/app/(backoffice)/planification/actions';

export function PropositionActions({
  id,
  statut,
}: {
  id: number;
  statut: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [dateDebut, setDateDebut] = useState('');

  function run(fn: () => Promise<void | number>) {
    setError(null);
    start(async () => {
      try {
        const result = await fn();
        if (typeof result === 'number') {
          router.push(`/planification/propositions/${result}`);
        } else {
          router.refresh();
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Action impossible');
      }
    });
  }

  if (statut === 'appliquee' || statut === 'archivee') {
    return <p className="text-sm text-ink/50">Proposition {statut} — lecture seule.</p>;
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-theme border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}
      <div>
        <label className="label" htmlFor="dateDebut">
          Date début lots (optionnel)
        </label>
        <input
          id="dateDebut"
          type="date"
          className="field max-w-xs"
          value={dateDebut}
          onChange={(e) => setDateDebut(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-primary"
          disabled={pending}
          onClick={() =>
            run(() => actionAppliquerProposition(id, dateDebut || undefined))
          }
        >
          Appliquer → lots Culture
        </button>
        <button
          type="button"
          className="btn-ghost"
          disabled={pending}
          onClick={() => run(() => actionRecalculerProposition(id))}
        >
          Recalculer
        </button>
        <button
          type="button"
          className="btn-ghost text-red-700"
          disabled={pending}
          onClick={() => run(() => actionArchiverProposition(id))}
        >
          Archiver
        </button>
      </div>
    </div>
  );
}
