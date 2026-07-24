import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductionNav } from '@/components/production/ProductionNav';
import { ProductionActions } from '@/components/production/ProductionActions';
import { getProduction } from '@/services/production';

export const dynamic = 'force-dynamic';

export default async function ProductionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  let p;
  try {
    p = await getProduction(id);
  } catch {
    notFound();
  }

  return (
    <div>
      <ProductionNav current="/production/lots" />
      <Link href="/production/lots" className="text-sm text-primary">
        ← Productions
      </Link>
      <h1 className="mt-2 font-display text-3xl text-primary">Lot {p.numeroLot}</h1>
      <p className="text-ink/70">
        {p.recette.nom} · {p.date.toISOString().slice(0, 10)} · ×{p.facteurEchelle} ·{' '}
        <span className="font-medium text-primary">{p.statut}</span>
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-3 font-display text-lg text-primary">Matières requises</h2>
          <ul className="space-y-1 text-sm">
            {p.lignesMatiere.map((l) => (
              <li key={l.id}>
                {l.matiere.nom} — {l.quantiteRequise}
              </li>
            ))}
            {p.lignesMatiere.length === 0 && (
              <li className="text-ink/50">Aucune (recette sans ingrédients)</li>
            )}
          </ul>
        </div>
        <div className="card">
          <h2 className="mb-3 font-display text-lg text-primary">Sorties</h2>
          <ul className="space-y-1 text-sm">
            {p.sorties.map((s) => (
              <li key={s.id}>
                {s.produitFini.recette.nom} / {s.produitFini.conditionnement.nom} ×{' '}
                {s.quantiteUnites}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {p.etapes.length > 0 && (
        <div className="card mt-6">
          <h2 className="mb-3 font-display text-lg text-primary">Étapes</h2>
          <ol className="list-decimal space-y-1 pl-5 text-sm">
            {p.etapes.map((e) => (
              <li key={e.id}>
                {e.description}{' '}
                <span className="text-ink/50">({e.statut})</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="card mt-6">
        <h2 className="mb-3 font-display text-lg text-primary">Actions</h2>
        <ProductionActions id={p.id} statut={p.statut} />
      </div>
    </div>
  );
}
