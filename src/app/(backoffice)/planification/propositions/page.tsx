import Link from 'next/link';
import { PlanifNav } from '@/components/planification/PlanifNav';
import { listPropositions } from '@/services/planification';

export const dynamic = 'force-dynamic';

export default async function PropositionsPage({
  searchParams,
}: {
  searchParams: { annee?: string };
}) {
  const year = searchParams.annee
    ? Number(searchParams.annee)
    : new Date().getFullYear();
  const items = await listPropositions(year);

  return (
    <div>
      <PlanifNav current="/planification/propositions" />
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-primary">Propositions {year}</h1>
          <p className="text-sm text-ink/60">{items.length} version(s)</p>
        </div>
        <Link href="/planification/propositions/nouvelle" className="btn-primary">
          Générer
        </Link>
      </div>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 bg-canvas text-ink/60">
            <tr>
              <th className="px-4 py-2 font-medium">Version</th>
              <th className="px-4 py-2 font-medium">Statut</th>
              <th className="px-4 py-2 font-medium">Lignes</th>
              <th className="px-4 py-2 font-medium">Créée</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-b border-ink/5 hover:bg-primary/5">
                <td className="px-4 py-2">
                  <Link
                    href={`/planification/propositions/${p.id}`}
                    className="font-medium text-primary"
                  >
                    v{p.version}
                  </Link>
                </td>
                <td className="px-4 py-2">{p.statut}</td>
                <td className="px-4 py-2">{p._count.lignes}</td>
                <td className="px-4 py-2">{p.createdAt.toISOString().slice(0, 10)}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-ink/50">
                  Aucune proposition pour {year}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
