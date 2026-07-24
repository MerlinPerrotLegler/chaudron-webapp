import Link from 'next/link';
import { ProductionNav } from '@/components/production/ProductionNav';
import { ActionForm } from '@/components/ui/ActionForm';
import { actionCreateProduction } from '../../actions';
import { listRecettes } from '@/services/recette';
import { listProduits } from '@/services/produit';
import { listEmplacements } from '@/services/stock';

export const dynamic = 'force-dynamic';

export default async function NouveauLotProductionPage() {
  const [recettes, produits, emplacements] = await Promise.all([
    listRecettes({ pageSize: 200 }),
    listProduits({ actif: true, pageSize: 200 }),
    listEmplacements(),
  ]);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <ProductionNav current="/production/lots" />
      <Link href="/production/lots" className="text-sm text-primary">
        ← Productions
      </Link>
      <h1 className="mt-2 font-display text-3xl text-primary">Nouveau lot de production</h1>
      <p className="mb-6 text-sm text-ink/60">
        Création en cours — terminer pour déstocker les matières et entrer les produits.
      </p>

      <div className="card max-w-lg">
        <ActionForm action={actionCreateProduction} submitLabel="Créer">
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="date">
                Date
              </label>
              <input
                id="date"
                name="date"
                type="date"
                className="field"
                defaultValue={today}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="numeroLot">
                N° de lot
              </label>
              <input id="numeroLot" name="numeroLot" className="field" required />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="facteurEchelle">
              Facteur d&apos;échelle
            </label>
            <input
              id="facteurEchelle"
              name="facteurEchelle"
              type="number"
              step="any"
              min="0.01"
              className="field"
              defaultValue={1}
            />
          </div>
          <div>
            <label className="label" htmlFor="produitFiniId">
              Produit fini (sortie)
            </label>
            <select id="produitFiniId" name="produitFiniId" className="field" required>
              {produits.items.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.recette.nom} — {p.conditionnement.nom}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="quantiteUnites">
              Quantité (unités)
            </label>
            <input
              id="quantiteUnites"
              name="quantiteUnites"
              type="number"
              step="any"
              min="0.001"
              className="field"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="emplacementId">
              Emplacement
            </label>
            <select id="emplacementId" name="emplacementId" className="field" defaultValue="">
              <option value="">—</option>
              {emplacements.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nom}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="datePeremption">
              DLUO
            </label>
            <input id="datePeremption" name="datePeremption" type="date" className="field" />
          </div>
          <div>
            <label className="label" htmlFor="operateurNom">
              Opérateur
            </label>
            <input id="operateurNom" name="operateurNom" className="field" />
          </div>
          <div>
            <label className="label" htmlFor="notes">
              Notes
            </label>
            <textarea id="notes" name="notes" className="field" rows={2} />
          </div>
        </ActionForm>
      </div>
    </div>
  );
}
