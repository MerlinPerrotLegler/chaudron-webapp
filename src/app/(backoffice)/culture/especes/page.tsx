import Link from 'next/link';
import { CultureNav } from '@/components/culture/CultureNav';
import { listEspeces } from '@/services/espece';

export const dynamic = 'force-dynamic';

export default async function EspecesPage() {
  const { items, total } = await listEspeces({ pageSize: 100 });

  return (
    <div>
      <CultureNav current="/culture/especes" />
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-primary">Espèces</h1>
          <p className="text-sm text-ink/60">{total} espèce(s)</p>
        </div>
        <Link href="/culture/especes/nouvelle" className="btn-primary">
          Nouvelle espèce
        </Link>
      </div>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 bg-canvas text-ink/60">
            <tr>
              <th className="px-4 py-2 font-medium">Nom</th>
              <th className="px-4 py-2 font-medium">Cycle</th>
              <th className="px-4 py-2 font-medium">Eau</th>
              <th className="px-4 py-2 font-medium">Rendement sec</th>
            </tr>
          </thead>
          <tbody>
            {items.map((e) => (
              <tr key={e.id} className="border-b border-ink/5 hover:bg-primary/5">
                <td className="px-4 py-2">
                  <Link href={`/culture/especes/${e.id}`} className="font-medium text-primary">
                    {e.nom}
                  </Link>
                </td>
                <td className="px-4 py-2">{e.cycle ?? '—'}</td>
                <td className="px-4 py-2">{e.besoinEau ?? '—'}</td>
                <td className="px-4 py-2">
                  {e.rendementKgHaSec != null ? `${e.rendementKgHaSec} kg/ha` : '—'}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-ink/50">
                  Aucune espèce
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
