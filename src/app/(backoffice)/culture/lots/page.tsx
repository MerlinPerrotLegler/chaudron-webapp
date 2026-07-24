import Link from 'next/link';
import { CultureNav } from '@/components/culture/CultureNav';
import { listLots } from '@/services/lotCulture';

export const dynamic = 'force-dynamic';

export default async function LotsPage() {
  const year = new Date().getFullYear();
  const { items, total } = await listLots({ annee: year, pageSize: 100 });

  return (
    <div>
      <CultureNav current="/culture/lots" />
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-primary">Lots {year}</h1>
          <p className="text-sm text-ink/60">{total} lot(s)</p>
        </div>
        <Link href="/culture/lots/nouveau" className="btn-primary">
          Nouveau lot
        </Link>
      </div>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 bg-canvas text-ink/60">
            <tr>
              <th className="px-4 py-2 font-medium">#</th>
              <th className="px-4 py-2 font-medium">Espèce</th>
              <th className="px-4 py-2 font-medium">Planche</th>
              <th className="px-4 py-2 font-medium">Surface</th>
              <th className="px-4 py-2 font-medium">Priorité</th>
              <th className="px-4 py-2 font-medium">État</th>
            </tr>
          </thead>
          <tbody>
            {items.map((l) => (
              <tr key={l.id} className="border-b border-ink/5 hover:bg-primary/5">
                <td className="px-4 py-2">
                  <Link href={`/culture/lots/${l.id}`} className="font-medium text-primary">
                    #{l.id}
                  </Link>
                </td>
                <td className="px-4 py-2">{l.espece.nom}</td>
                <td className="px-4 py-2">{l.planche.code}</td>
                <td className="px-4 py-2">{l.surfaceM2} m²</td>
                <td className="px-4 py-2">{l.priorite}</td>
                <td className="px-4 py-2">{l.etat}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink/50">
                  Aucun lot pour {year}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
