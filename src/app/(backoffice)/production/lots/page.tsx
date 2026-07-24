import Link from 'next/link';
import { ProductionNav } from '@/components/production/ProductionNav';
import { listProductions } from '@/services/production';

export const dynamic = 'force-dynamic';

export default async function ProductionsPage() {
  const { items, total } = await listProductions({ pageSize: 50 });

  return (
    <div>
      <ProductionNav current="/production/lots" />
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-primary">Productions</h1>
          <p className="text-sm text-ink/60">{total} lot(s)</p>
        </div>
        <Link href="/production/lots/nouveau" className="btn-primary">
          Nouveau lot
        </Link>
      </div>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 bg-canvas text-ink/60">
            <tr>
              <th className="px-4 py-2 font-medium">Lot</th>
              <th className="px-4 py-2 font-medium">Date</th>
              <th className="px-4 py-2 font-medium">Recette</th>
              <th className="px-4 py-2 font-medium">Échelle</th>
              <th className="px-4 py-2 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-b border-ink/5 hover:bg-primary/5">
                <td className="px-4 py-2">
                  <Link href={`/production/lots/${p.id}`} className="font-medium text-primary">
                    {p.numeroLot}
                  </Link>
                </td>
                <td className="px-4 py-2">{p.date.toISOString().slice(0, 10)}</td>
                <td className="px-4 py-2">{p.recette.nom}</td>
                <td className="px-4 py-2">×{p.facteurEchelle}</td>
                <td className="px-4 py-2">{p.statut}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink/50">
                  Aucune production
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
