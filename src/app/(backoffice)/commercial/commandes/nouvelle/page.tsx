import Link from 'next/link';
import { CommercialNav } from '@/components/commercial/CommercialNav';
import { ActionForm } from '@/components/ui/ActionForm';
import { actionCreateCommande } from '../../actions';
import { listClients } from '@/services/client';
import { listPointsVente } from '@/services/pointVente';
import { listProduits } from '@/services/produit';

export const dynamic = 'force-dynamic';

export default async function NouvelleCommandePage() {
  const [clients, pdvs, produits] = await Promise.all([
    listClients({ pageSize: 200 }),
    listPointsVente(),
    listProduits({ actif: true, pageSize: 200 }),
  ]);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <CommercialNav current="/commercial/commandes" />
      <Link href="/commercial/commandes" className="text-sm text-primary">
        ← Commandes
      </Link>
      <h1 className="mt-2 font-display text-3xl text-primary">Nouvelle commande</h1>
      <p className="text-sm text-ink/60">V1 : une ligne produit à la création (ajouter via API ensuite).</p>

      <div className="card mt-6 max-w-lg">
        <ActionForm action={actionCreateCommande} submitLabel="Créer">
          <div>
            <label className="label" htmlFor="clientId">
              Client
            </label>
            <select id="clientId" name="clientId" className="field" required>
              {clients.items.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="pointVenteId">
              Point de vente
            </label>
            <select id="pointVenteId" name="pointVenteId" className="field" required>
              {pdvs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nom}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="dateCommande">
                Date commande
              </label>
              <input
                id="dateCommande"
                name="dateCommande"
                type="date"
                className="field"
                defaultValue={today}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="dateLivraison">
                Date livraison
              </label>
              <input
                id="dateLivraison"
                name="dateLivraison"
                type="date"
                className="field"
                defaultValue={today}
                required
              />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="produitFiniId">
              Produit
            </label>
            <select id="produitFiniId" name="produitFiniId" className="field" required>
              {produits.items.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.recette.nom} — {p.conditionnement.nom}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="quantite">
                Quantité
              </label>
              <input
                id="quantite"
                name="quantite"
                type="number"
                step="any"
                min="0.01"
                className="field"
                defaultValue="1"
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="prixUnitaire">
                Prix unitaire (optionnel)
              </label>
              <input
                id="prixUnitaire"
                name="prixUnitaire"
                type="number"
                step="0.01"
                min="0"
                className="field"
              />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="reference">
              Référence
            </label>
            <input id="reference" name="reference" className="field" />
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
