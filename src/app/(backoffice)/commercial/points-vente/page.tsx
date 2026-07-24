import Link from 'next/link';
import { CommercialNav } from '@/components/commercial/CommercialNav';
import { ActionForm } from '@/components/ui/ActionForm';
import { actionCreatePointVente } from '../actions';
import { listPointsVente } from '@/services/pointVente';

export const dynamic = 'force-dynamic';

export default async function PointsVentePage() {
  const items = await listPointsVente();

  return (
    <div>
      <CommercialNav current="/commercial/points-vente" />
      <h1 className="font-display text-3xl text-primary">Points de vente</h1>
      <p className="mb-6 text-sm text-ink/60">{items.length} canal(aux)</p>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink/10 bg-canvas text-ink/60">
              <tr>
                <th className="px-4 py-2 font-medium">Nom</th>
                <th className="px-4 py-2 font-medium">Type</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-b border-ink/5 hover:bg-primary/5">
                  <td className="px-4 py-2">
                    <Link
                      href={`/commercial/points-vente/${p.id}`}
                      className="font-medium text-primary"
                    >
                      {p.nom}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{p.type}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-4 py-6 text-center text-ink/50">
                    Aucun point de vente
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h2 className="mb-3 font-display text-lg text-primary">Nouveau canal</h2>
          <ActionForm action={actionCreatePointVente} submitLabel="Créer">
            <div>
              <label className="label" htmlFor="nom">
                Nom
              </label>
              <input id="nom" name="nom" className="field" required />
            </div>
            <div>
              <label className="label" htmlFor="type">
                Type
              </label>
              <select id="type" name="type" className="field" defaultValue="marche">
                <option value="ferme">Ferme</option>
                <option value="marche">Marché</option>
                <option value="boutique_producteur">Boutique producteur</option>
                <option value="demi_gros">Demi-gros</option>
                <option value="tournee">Tournée</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="contact">
                Contact
              </label>
              <input id="contact" name="contact" className="field" />
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
    </div>
  );
}
