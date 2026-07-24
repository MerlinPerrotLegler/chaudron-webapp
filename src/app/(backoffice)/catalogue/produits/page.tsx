import Link from 'next/link';
import { CatalogueNav } from '@/components/catalogue/CatalogueNav';
import { listProduits } from '@/services/produit';

export const dynamic = 'force-dynamic';

export default async function ProduitsPage() {
  const { items, total } = await listProduits({ pageSize: 100 });

  return (
    <div>
      <CatalogueNav current="/catalogue/produits" />
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-primary">Produits finis</h1>
          <p className="text-sm text-ink/60">{total} produit(s)</p>
        </div>
        <Link href="/catalogue/produits/nouveau" className="btn-primary">
          Nouveau produit
        </Link>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 bg-canvas text-ink/60">
            <tr>
              <th className="px-4 py-2 font-medium">Recette</th>
              <th className="px-4 py-2 font-medium">Conditionnement</th>
              <th className="px-4 py-2 font-medium">Poids</th>
              <th className="px-4 py-2 font-medium">Prix</th>
              <th className="px-4 py-2 font-medium">Actif</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-b border-ink/5">
                <td className="px-4 py-2">
                  <Link href={`/catalogue/recettes/${p.recetteId}`} className="text-primary">
                    {p.recette.nom}
                  </Link>
                </td>
                <td className="px-4 py-2">{p.conditionnement.nom}</td>
                <td className="px-4 py-2">{p.poidsUnite}</td>
                <td className="px-4 py-2">
                  {p.prixVenteUnite != null ? `${p.prixVenteUnite.toFixed(2)} €` : '—'}
                </td>
                <td className="px-4 py-2">{p.actif ? 'oui' : 'non'}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink/50">
                  Aucun produit
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
