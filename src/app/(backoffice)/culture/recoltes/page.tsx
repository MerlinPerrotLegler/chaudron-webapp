import { CultureNav } from '@/components/culture/CultureNav';
import { ActionForm } from '@/components/ui/ActionForm';
import { actionDeclareRecolte } from '../actions';
import { listRecoltes } from '@/services/recolte';
import { listLots } from '@/services/lotCulture';
import { listMatieres } from '@/services/matiere';

export const dynamic = 'force-dynamic';

export default async function RecoltesPage() {
  const year = new Date().getFullYear();
  const [recoltes, lots, matieres] = await Promise.all([
    listRecoltes({ pageSize: 40 }),
    listLots({ annee: year, pageSize: 100 }),
    listMatieres({ provenance: 'fermiere', pageSize: 100 }),
  ]);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <CultureNav current="/culture/recoltes" />
      <h1 className="font-display text-3xl text-primary">Récoltes</h1>
      <p className="mb-6 text-sm text-ink/60">Entrée matière fermière en stock.</p>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-3 font-display text-lg text-primary">Déclarer</h2>
          <ActionForm action={actionDeclareRecolte} submitLabel="Enregistrer">
            <div>
              <label className="label" htmlFor="lotId">
                Lot
              </label>
              <select id="lotId" name="lotId" className="field" required>
                {lots.items.map((l) => (
                  <option key={l.id} value={l.id}>
                    #{l.id} {l.espece.nom} · {l.planche.code}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="matiereId">
                Matière (fermière, même espèce)
              </label>
              <select id="matiereId" name="matiereId" className="field" required>
                {matieres.items.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nom}
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
                <label className="label" htmlFor="poidsKg">
                  Poids (kg)
                </label>
                <input
                  id="poidsKg"
                  name="poidsKg"
                  type="number"
                  step="any"
                  min="0.001"
                  className="field"
                  required
                />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="qualite">
                Qualité
              </label>
              <select id="qualite" name="qualite" className="field" defaultValue="A">
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="notes">
                Notes
              </label>
              <textarea id="notes" name="notes" className="field" rows={2} />
            </div>
          </ActionForm>
        </div>

        <div className="card overflow-x-auto p-0">
          <h2 className="border-b border-ink/10 px-4 py-3 font-display text-lg text-primary">
            Récentes
          </h2>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink/10 bg-canvas text-ink/60">
              <tr>
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium">Lot</th>
                <th className="px-4 py-2 font-medium">Matière</th>
                <th className="px-4 py-2 font-medium">Poids</th>
              </tr>
            </thead>
            <tbody>
              {recoltes.items.map((r) => (
                <tr key={r.id} className="border-b border-ink/5">
                  <td className="px-4 py-2">{r.date.toISOString().slice(0, 10)}</td>
                  <td className="px-4 py-2">#{r.lotId}</td>
                  <td className="px-4 py-2">{r.matiere?.nom ?? r.matiereId}</td>
                  <td className="px-4 py-2">{r.poidsKg} kg</td>
                </tr>
              ))}
              {recoltes.items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-ink/50">
                    Aucune récolte
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
