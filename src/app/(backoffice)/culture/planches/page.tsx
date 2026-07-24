import Link from 'next/link';
import { CultureNav } from '@/components/culture/CultureNav';
import { ActionForm } from '@/components/ui/ActionForm';
import { actionCreatePlanche } from '../actions';
import { listPlanches } from '@/services/planche';
import { listParcelles } from '@/services/parcelle';

export const dynamic = 'force-dynamic';

export default async function PlanchesPage() {
  const [planches, parcelles] = await Promise.all([
    listPlanches({ pageSize: 100 }),
    listParcelles({ pageSize: 100 }),
  ]);

  return (
    <div>
      <CultureNav current="/culture/planches" />
      <h1 className="font-display text-3xl text-primary">Planches</h1>
      <p className="mb-6 text-sm text-ink/60">{planches.total} planche(s)</p>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink/10 bg-canvas text-ink/60">
              <tr>
                <th className="px-4 py-2 font-medium">Code</th>
                <th className="px-4 py-2 font-medium">Parcelle</th>
                <th className="px-4 py-2 font-medium">Surface</th>
              </tr>
            </thead>
            <tbody>
              {planches.items.map((pl) => (
                <tr key={pl.id} className="border-b border-ink/5 hover:bg-primary/5">
                  <td className="px-4 py-2">
                    <Link href={`/culture/planches/${pl.id}`} className="font-medium text-primary">
                      {pl.code}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{pl.parcelle.code}</td>
                  <td className="px-4 py-2">{pl.surfaceM2} m²</td>
                </tr>
              ))}
              {planches.items.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-ink/50">
                    Aucune planche
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h2 className="mb-3 font-display text-lg text-primary">Nouvelle planche</h2>
          <ActionForm action={actionCreatePlanche} submitLabel="Créer">
            <div>
              <label className="label" htmlFor="parcelleId">
                Parcelle
              </label>
              <select id="parcelleId" name="parcelleId" className="field" required>
                {parcelles.items.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="numero">
                Numéro
              </label>
              <input id="numero" name="numero" className="field" placeholder="01" required />
            </div>
            <div>
              <label className="label" htmlFor="surfaceM2">
                Surface (m²)
              </label>
              <input
                id="surfaceM2"
                name="surfaceM2"
                type="number"
                step="any"
                min="0.01"
                className="field"
                required
              />
            </div>
          </ActionForm>
        </div>
      </div>
    </div>
  );
}
