import Link from 'next/link';
import { CommercialNav } from '@/components/commercial/CommercialNav';
import { listVentes } from '@/services/vente';

export const dynamic = 'force-dynamic';

export default async function VentesPage() {
  const { items, total } = await listVentes({ pageSize: 50 });

  return (
    <div>
      <CommercialNav current="/commercial/ventes" />
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-primary">Ventes</h1>
          <p className="text-sm text-ink/60">{total} ligne(s)</p>
        </div>
        <Link href="/storefront" className="btn-primary">
          Vente marché
        </Link>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 bg-canvas text-ink/60">
            <tr>
              <th className="px-4 py-2 font-medium">Date</th>
              <th className="px-4 py-2 font-medium">Produit</th>
              <th className="px-4 py-2 font-medium">Canal</th>
              <th className="px-4 py-2 font-medium">Client</th>
              <th className="px-4 py-2 font-medium">Qté</th>
              <th className="px-4 py-2 font-medium">Montant</th>
              <th className="px-4 py-2 font-medium">Source</th>
              <th className="px-4 py-2 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody>
            {items.map((v) => (
              <tr key={v.id} className="border-b border-ink/5">
                <td className="px-4 py-2">{v.date.toISOString().slice(0, 10)}</td>
                <td className="px-4 py-2">{v.produitFini.recette.nom}</td>
                <td className="px-4 py-2">{v.pointVente.nom}</td>
                <td className="px-4 py-2">{v.client?.nom ?? '—'}</td>
                <td className="px-4 py-2">{v.quantite}</td>
                <td className="px-4 py-2">{v.montant.toFixed(2)} €</td>
                <td className="px-4 py-2">{v.source}</td>
                <td className="px-4 py-2">{v.statut}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-ink/50">
                  Aucune vente — utilisez le storefront ou livrez une commande.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
