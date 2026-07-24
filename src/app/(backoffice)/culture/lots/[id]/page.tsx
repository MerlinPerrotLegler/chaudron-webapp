import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CultureNav } from '@/components/culture/CultureNav';
import { getLot } from '@/services/lotCulture';

export const dynamic = 'force-dynamic';

export default async function LotDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  let lot;
  try {
    lot = await getLot(id);
  } catch {
    notFound();
  }

  return (
    <div>
      <CultureNav current="/culture/lots" />
      <Link href="/culture/lots" className="text-sm text-primary">
        ← Lots
      </Link>
      <h1 className="mt-2 font-display text-3xl text-primary">
        Lot #{lot.id} — {lot.espece.nom}
      </h1>
      <p className="text-ink/70">
        {lot.planche.code} · {lot.annee} · {lot.surfaceM2} m² · {lot.priorite} ·{' '}
        <span className="font-medium text-primary">{lot.etat}</span>
      </p>

      <div className="card mt-6">
        <h2 className="mb-3 font-display text-lg text-primary">Étapes (cascade)</h2>
        {lot.etapes.length === 0 ? (
          <p className="text-sm text-ink/50">
            Pas d&apos;itinéraire sur l&apos;espèce — aucune étape générée.
          </p>
        ) : (
          <ol className="space-y-2 text-sm">
            {lot.etapes.map((e) => (
              <li
                key={e.id}
                className="flex flex-wrap items-baseline justify-between gap-2 border-b border-ink/5 py-1"
              >
                <span>
                  {e.ordre}. {e.code}
                  {e.libelle ? ` — ${e.libelle}` : ''}
                  {e.fait && (
                    <span className="ml-2 rounded bg-primary/15 px-1.5 text-xs text-primary">
                      fait
                    </span>
                  )}
                </span>
                <span className="text-ink/60">
                  {e.datePrevue ? e.datePrevue.toISOString().slice(0, 10) : '—'}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <Link href="/culture/recoltes" className="btn-ghost mt-4 inline-flex">
        Déclarer une récolte →
      </Link>
    </div>
  );
}
