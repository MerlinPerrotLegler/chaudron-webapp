import Link from 'next/link';
import { StockNav } from '@/components/stock/StockNav';
import { listSoldesMatieres } from '@/services/stock';

export const dynamic = 'force-dynamic';

export default async function SoldesMatieresPage() {
  const items = await listSoldesMatieres();

  return (
    <div>
      <StockNav current="/stock/matieres" />
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-primary">Soldes matières</h1>
          <p className="text-sm text-ink/60">{items.length} matière(s)</p>
        </div>
        <Link href="/stock/achats" className="btn-primary">
          Déclarer un achat
        </Link>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 bg-canvas text-ink/60">
            <tr>
              <th className="px-4 py-2 font-medium">Nom</th>
              <th className="px-4 py-2 font-medium">Provenance</th>
              <th className="px-4 py-2 font-medium">Solde</th>
              <th className="px-4 py-2 font-medium">Mini</th>
            </tr>
          </thead>
          <tbody>
            {items.map((m) => {
              const sousMini = m.stockMini != null && m.solde < m.stockMini;
              return (
                <tr
                  key={m.id}
                  className={`border-b border-ink/5 ${sousMini ? 'bg-red-50' : ''}`}
                >
                  <td className="px-4 py-2">
                    <Link href={`/catalogue/matieres/${m.id}`} className="text-primary">
                      {m.nom}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{m.provenance}</td>
                  <td className="px-4 py-2 font-medium">
                    {m.solde} {m.uniteAchat}
                  </td>
                  <td className="px-4 py-2">
                    {m.stockMini != null ? `${m.stockMini} ${m.uniteAchat}` : '—'}
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-ink/50">
                  Aucune matière au catalogue
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
