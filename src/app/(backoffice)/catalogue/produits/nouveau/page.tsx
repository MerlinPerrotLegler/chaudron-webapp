import Link from 'next/link';
import { CatalogueNav } from '@/components/catalogue/CatalogueNav';
import { ActionForm } from '@/components/ui/ActionForm';
import { actionCreateProduit } from '../../actions';
import { listRecettes } from '@/services/recette';
import { listConditionnements } from '@/services/conditionnement';

export const dynamic = 'force-dynamic';

export default async function NouveauProduitPage() {
  const [recettes, conditionnements] = await Promise.all([
    listRecettes({ pageSize: 200 }),
    listConditionnements({ pageSize: 200 }),
  ]);

  return (
    <div>
      <CatalogueNav current="/catalogue/produits" />
      <Link href="/catalogue/produits" className="text-sm text-primary">
        ← Produits
      </Link>
      <h1 className="mt-2 font-display text-3xl text-primary">Nouveau produit</h1>

      <div className="card mt-6 max-w-lg">
        <ActionForm action={actionCreateProduit} submitLabel="Créer">
          <div>
            <label className="label" htmlFor="recetteId">
              Recette
            </label>
            <select id="recetteId" name="recetteId" className="field" required>
              {recettes.items.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nom}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="conditionnementId">
              Conditionnement
            </label>
            <select id="conditionnementId" name="conditionnementId" className="field" required>
              {conditionnements.items.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="poidsUnite">
              Poids / unité
            </label>
            <input
              id="poidsUnite"
              name="poidsUnite"
              type="number"
              step="any"
              min="0.001"
              className="field"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="prixVenteUnite">
              Prix vente / unité (€)
            </label>
            <input
              id="prixVenteUnite"
              name="prixVenteUnite"
              type="number"
              step="0.01"
              min="0"
              className="field"
            />
          </div>
        </ActionForm>
      </div>
    </div>
  );
}
