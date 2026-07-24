import Link from 'next/link';
import { CommercialNav } from '@/components/commercial/CommercialNav';
import { listClients } from '@/services/client';

export const dynamic = 'force-dynamic';

export default async function ClientsPage() {
  const { items, total } = await listClients({ pageSize: 100 });

  return (
    <div>
      <CommercialNav current="/commercial/clients" />
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-primary">Clients</h1>
          <p className="text-sm text-ink/60">{total} client(s)</p>
        </div>
        <Link href="/commercial/clients/nouveau" className="btn-primary">
          Nouveau client
        </Link>
      </div>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 bg-canvas text-ink/60">
            <tr>
              <th className="px-4 py-2 font-medium">Nom</th>
              <th className="px-4 py-2 font-medium">Type</th>
              <th className="px-4 py-2 font-medium">Contact</th>
              <th className="px-4 py-2 font-medium">Ville</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="border-b border-ink/5 hover:bg-primary/5">
                <td className="px-4 py-2">
                  <Link
                    href={`/commercial/clients/${c.id}`}
                    className="font-medium text-primary"
                  >
                    {c.nom}
                  </Link>
                </td>
                <td className="px-4 py-2">{c.type ?? '—'}</td>
                <td className="px-4 py-2">{c.contactNom ?? c.email ?? '—'}</td>
                <td className="px-4 py-2">{c.ville ?? '—'}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-ink/50">
                  Aucun client
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
