import Link from 'next/link';
import { CatalogueNav } from '@/components/catalogue/CatalogueNav';
import { listRecettes } from '@/services/recette';

export const dynamic = 'force-dynamic';

export default async function RecettesPage() {
  const { items, total } = await listRecettes({ pageSize: 100 });

  return (
    <div>
      <CatalogueNav current="/catalogue/recettes" />
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-primary">Recettes</h1>
          <p className="text-sm text-ink/60">{total} recette(s)</p>
        </div>
        <Link href="/catalogue/recettes/nouvelle" className="btn-primary">
          Nouvelle recette
        </Link>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 bg-canvas text-ink/60">
            <tr>
              <th className="px-4 py-2 font-medium">Nom</th>
              <th className="px-4 py-2 font-medium">Famille</th>
              <th className="px-4 py-2 font-medium">Type</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id} className="border-b border-ink/5 hover:bg-primary/5">
                <td className="px-4 py-2">
                  <Link href={`/catalogue/recettes/${r.id}`} className="font-medium text-primary">
                    {r.nom}
                  </Link>
                </td>
                <td className="px-4 py-2">{r.famille}</td>
                <td className="px-4 py-2">{r.type}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-ink/50">
                  Aucune recette
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
