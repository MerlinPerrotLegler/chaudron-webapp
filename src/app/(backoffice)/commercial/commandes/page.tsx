import Link from 'next/link';
import { CommercialNav } from '@/components/commercial/CommercialNav';
import { listCommandes } from '@/services/commande';

export const dynamic = 'force-dynamic';

export default async function CommandesPage({
  searchParams,
}: {
  searchParams?: { statut?: string };
}) {
  const { items, total } = await listCommandes({
    statut: searchParams?.statut,
    pageSize: 50,
  });

  return (
    <div>
      <CommercialNav current="/commercial/commandes" />
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-primary">Commandes</h1>
          <p className="text-sm text-ink/60">{total} commande(s)</p>
        </div>
        <Link href="/commercial/commandes/nouvelle" className="btn-primary">
          Nouvelle commande
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        {[
          ['', 'Toutes'],
          ['brouillon', 'Brouillon'],
          ['confirmee', 'Confirmées'],
          ['preparee', 'Préparées'],
          ['livree', 'Livrées'],
          ['annulee', 'Annulées'],
        ].map(([v, label]) => (
          <Link
            key={v || 'all'}
            href={v ? `/commercial/commandes?statut=${v}` : '/commercial/commandes'}
            className={`rounded-theme px-3 py-1 ${
              (searchParams?.statut ?? '') === v
                ? 'bg-accent/40 font-medium'
                : 'border border-ink/10 hover:bg-ink/5'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 bg-canvas text-ink/60">
            <tr>
              <th className="px-4 py-2 font-medium">#</th>
              <th className="px-4 py-2 font-medium">Client</th>
              <th className="px-4 py-2 font-medium">Canal</th>
              <th className="px-4 py-2 font-medium">Livraison</th>
              <th className="px-4 py-2 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="border-b border-ink/5 hover:bg-primary/5">
                <td className="px-4 py-2">
                  <Link
                    href={`/commercial/commandes/${c.id}`}
                    className="font-medium text-primary"
                  >
                    #{c.id}
                  </Link>
                </td>
                <td className="px-4 py-2">{c.client.nom}</td>
                <td className="px-4 py-2">{c.pointVente.nom}</td>
                <td className="px-4 py-2">
                  {c.dateLivraison.toISOString().slice(0, 10)}
                </td>
                <td className="px-4 py-2">{c.statut}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink/50">
                  Aucune commande
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
