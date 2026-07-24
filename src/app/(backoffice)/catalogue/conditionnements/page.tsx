import Link from 'next/link';
import { CatalogueNav } from '@/components/catalogue/CatalogueNav';
import { ActionForm } from '@/components/ui/ActionForm';
import { actionCreateConditionnement } from '../actions';
import { listConditionnements } from '@/services/conditionnement';

export const dynamic = 'force-dynamic';

export default async function ConditionnementsPage() {
  const { items, total } = await listConditionnements({ pageSize: 100 });

  return (
    <div>
      <CatalogueNav current="/catalogue/conditionnements" />
      <h1 className="font-display text-3xl text-primary">Conditionnements</h1>
      <p className="mb-6 text-sm text-ink/60">{total} conditionnement(s)</p>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink/10 bg-canvas text-ink/60">
              <tr>
                <th className="px-4 py-2 font-medium">Nom</th>
                <th className="px-4 py-2 font-medium">Coût total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-b border-ink/5">
                  <td className="px-4 py-2">{c.nom}</td>
                  <td className="px-4 py-2">{c.coutTotal.toFixed(2)} €</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-4 py-6 text-center text-ink/50">
                    Aucun conditionnement
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h2 className="mb-3 font-display text-lg text-primary">Nouveau</h2>
          <ActionForm action={actionCreateConditionnement} submitLabel="Créer">
            <div>
              <label className="label" htmlFor="nom">
                Nom
              </label>
              <input id="nom" name="nom" className="field" required />
            </div>
            <div>
              <label className="label" htmlFor="coutTotal">
                Coût total (€)
              </label>
              <input
                id="coutTotal"
                name="coutTotal"
                type="number"
                step="0.01"
                min="0"
                className="field"
                defaultValue="0"
              />
            </div>
          </ActionForm>
        </div>
      </div>
    </div>
  );
}
