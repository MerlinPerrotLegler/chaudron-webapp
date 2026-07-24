import { StockNav } from '@/components/stock/StockNav';
import { listSoldesProduits } from '@/services/stock';

export const dynamic = 'force-dynamic';

export default async function SoldesProduitsPage() {
  const items = await listSoldesProduits();

  return (
    <div>
      <StockNav current="/stock/produits" />
      <h1 className="font-display text-3xl text-primary">Soldes produits</h1>
      <p className="mb-6 text-sm text-ink/60">{items.length} produit(s) actif(s)</p>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 bg-canvas text-ink/60">
            <tr>
              <th className="px-4 py-2 font-medium">Produit</th>
              <th className="px-4 py-2 font-medium">Solde (unités)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-b border-ink/5">
                <td className="px-4 py-2">{p.nom}</td>
                <td className="px-4 py-2 font-medium">{p.solde}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-8 text-center text-ink/50">
                  Aucun produit actif
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
