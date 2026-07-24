import Link from 'next/link';
import { ProductionNav } from '@/components/production/ProductionNav';
import { listTransformations } from '@/services/transformation';

export const dynamic = 'force-dynamic';

export default async function TransformationsPage() {
  const { items, total } = await listTransformations({ pageSize: 50 });

  return (
    <div>
      <ProductionNav current="/production/transformations" />
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-primary">Transformations</h1>
          <p className="text-sm text-ink/60">{total} opération(s)</p>
        </div>
        <Link href="/production/transformations/nouvelle" className="btn-primary">
          Déclarer
        </Link>
      </div>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 bg-canvas text-ink/60">
            <tr>
              <th className="px-4 py-2 font-medium">Date</th>
              <th className="px-4 py-2 font-medium">Type</th>
              <th className="px-4 py-2 font-medium">Sortie</th>
              <th className="px-4 py-2 font-medium">Qté</th>
              <th className="px-4 py-2 font-medium">Rendement</th>
            </tr>
          </thead>
          <tbody>
            {items.map((t) => (
              <tr key={t.id} className="border-b border-ink/5 hover:bg-primary/5">
                <td className="px-4 py-2">
                  <Link
                    href={`/production/transformations/${t.id}`}
                    className="font-medium text-primary"
                  >
                    {t.date.toISOString().slice(0, 10)}
                  </Link>
                </td>
                <td className="px-4 py-2">{t.type}</td>
                <td className="px-4 py-2">{t.matiereOut.nom}</td>
                <td className="px-4 py-2">
                  {t.quantiteOut} {t.uniteOut}
                </td>
                <td className="px-4 py-2">
                  {t.rendement != null ? `${(t.rendement * 100).toFixed(0)} %` : '—'}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink/50">
                  Aucune transformation
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
