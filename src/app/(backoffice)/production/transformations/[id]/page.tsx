import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductionNav } from '@/components/production/ProductionNav';
import { getTransformation } from '@/services/transformation';

export const dynamic = 'force-dynamic';

export default async function TransformationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  let t;
  try {
    t = await getTransformation(id);
  } catch {
    notFound();
  }

  return (
    <div>
      <ProductionNav current="/production/transformations" />
      <Link href="/production/transformations" className="text-sm text-primary">
        ← Transformations
      </Link>
      <h1 className="mt-2 font-display text-3xl text-primary">
        Transformation #{t.id}
      </h1>
      <p className="text-ink/70">
        {t.date.toISOString().slice(0, 10)} · {t.type} · {t.statut}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-3 font-display text-lg text-primary">Entrées</h2>
          <ul className="space-y-1 text-sm">
            {t.lignesIn.map((l) => (
              <li key={l.id}>
                {l.matiere.nom} — {l.quantite}
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h2 className="mb-3 font-display text-lg text-primary">Sortie</h2>
          <p className="text-sm">
            {t.matiereOut.nom} — {t.quantiteOut} {t.uniteOut}
            {t.rendement != null && (
              <span className="text-ink/60">
                {' '}
                · rendement {(t.rendement * 100).toFixed(0)} %
              </span>
            )}
          </p>
          {t.notes && <p className="mt-2 text-sm text-ink/70">{t.notes}</p>}
        </div>
      </div>
    </div>
  );
}
