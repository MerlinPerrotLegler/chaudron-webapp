import { StockNav } from '@/components/stock/StockNav';
import { ActionForm } from '@/components/ui/ActionForm';
import { actionCreateEmplacement } from '../actions';
import { listEmplacements } from '@/services/stock';

export const dynamic = 'force-dynamic';

export default async function EmplacementsPage() {
  const items = await listEmplacements();

  return (
    <div>
      <StockNav current="/stock/emplacements" />
      <h1 className="font-display text-3xl text-primary">Emplacements</h1>
      <p className="mb-6 text-sm text-ink/60">{items.length} emplacement(s)</p>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink/10 bg-canvas text-ink/60">
              <tr>
                <th className="px-4 py-2 font-medium">Nom</th>
                <th className="px-4 py-2 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {items.map((e) => (
                <tr key={e.id} className="border-b border-ink/5">
                  <td className="px-4 py-2 font-medium">{e.nom}</td>
                  <td className="px-4 py-2 text-ink/60">{e.notes ?? '—'}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-4 py-6 text-center text-ink/50">
                    Aucun emplacement
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h2 className="mb-3 font-display text-lg text-primary">Nouveau</h2>
          <ActionForm action={actionCreateEmplacement} submitLabel="Créer">
            <div>
              <label className="label" htmlFor="nom">
                Nom
              </label>
              <input id="nom" name="nom" className="field" required />
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
