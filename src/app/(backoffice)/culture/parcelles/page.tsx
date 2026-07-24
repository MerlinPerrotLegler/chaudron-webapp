import Link from 'next/link';
import { CultureNav } from '@/components/culture/CultureNav';
import { ActionForm } from '@/components/ui/ActionForm';
import { actionCreateParcelle } from '../actions';
import { listParcelles } from '@/services/parcelle';

export const dynamic = 'force-dynamic';

export default async function ParcellesPage() {
  const { items, total } = await listParcelles({ pageSize: 100 });

  return (
    <div>
      <CultureNav current="/culture/parcelles" />
      <h1 className="font-display text-3xl text-primary">Parcelles</h1>
      <p className="mb-6 text-sm text-ink/60">{total} parcelle(s)</p>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink/10 bg-canvas text-ink/60">
              <tr>
                <th className="px-4 py-2 font-medium">Code</th>
                <th className="px-4 py-2 font-medium">Vocation</th>
                <th className="px-4 py-2 font-medium">Surface</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-b border-ink/5 hover:bg-primary/5">
                  <td className="px-4 py-2">
                    <Link
                      href={`/culture/parcelles/${p.id}`}
                      className="font-medium text-primary"
                    >
                      {p.code}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{p.vocation}</td>
                  <td className="px-4 py-2">
                    {p.surfaceM2 != null ? `${p.surfaceM2} m²` : '—'}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-ink/50">
                    Aucune parcelle
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h2 className="mb-3 font-display text-lg text-primary">Nouvelle parcelle</h2>
          <ActionForm action={actionCreateParcelle} submitLabel="Créer">
            <div>
              <label className="label" htmlFor="code">
                Code (lettres majuscules)
              </label>
              <input id="code" name="code" className="field" placeholder="SA" required />
            </div>
            <div>
              <label className="label" htmlFor="vocation">
                Vocation
              </label>
              <select id="vocation" name="vocation" className="field" defaultValue="tunnel">
                {[
                  'serre_semis',
                  'tunnel',
                  'frais',
                  'maraichage',
                  'draine_ensoleille',
                  'grande_culture',
                  'autre',
                ].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="surfaceM2">
                Surface (m²)
              </label>
              <input id="surfaceM2" name="surfaceM2" type="number" step="any" className="field" />
            </div>
          </ActionForm>
        </div>
      </div>
    </div>
  );
}
