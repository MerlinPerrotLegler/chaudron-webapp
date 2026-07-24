import { StockNav } from '@/components/stock/StockNav';
import { ActionForm } from '@/components/ui/ActionForm';
import { actionDeclareAchat } from '../actions';
import { listMatieres } from '@/services/matiere';
import { listAchatsRecents, listEmplacements } from '@/services/stock';

export const dynamic = 'force-dynamic';

export default async function AchatsPage() {
  const [matieres, emplacements, achats] = await Promise.all([
    listMatieres({ pageSize: 200 }),
    listEmplacements(),
    listAchatsRecents(40),
  ]);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <StockNav current="/stock/achats" />
      <h1 className="font-display text-3xl text-primary">Achats</h1>
      <p className="mb-6 text-sm text-ink/60">Entrée matière + lot stock (FIFO).</p>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-3 font-display text-lg text-primary">Déclarer un achat</h2>
          <ActionForm action={actionDeclareAchat} submitLabel="Enregistrer">
            <div>
              <label className="label" htmlFor="matiereId">
                Matière
              </label>
              <select id="matiereId" name="matiereId" className="field" required>
                {matieres.items.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nom} ({m.uniteAchat})
                  </option>
                ))}
              </select>
            </div>
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
                  min="0.001"
                  className="field"
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="prixUnitaire">
                  Prix unitaire (€)
                </label>
                <input
                  id="prixUnitaire"
                  name="prixUnitaire"
                  type="number"
                  step="0.01"
                  min="0"
                  className="field"
                  required
                />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="fournisseur">
                Fournisseur
              </label>
              <input id="fournisseur" name="fournisseur" className="field" />
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
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="ajouterPrixCatalogue"
                defaultChecked
                className="rounded"
              />
              Mettre à jour le prix catalogue
            </label>
          </ActionForm>
        </div>

        <div className="card overflow-x-auto p-0">
          <h2 className="border-b border-ink/10 px-4 py-3 font-display text-lg text-primary">
            Achats récents
          </h2>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink/10 bg-canvas text-ink/60">
              <tr>
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium">Matière</th>
                <th className="px-4 py-2 font-medium">Qté</th>
                <th className="px-4 py-2 font-medium">Prix</th>
              </tr>
            </thead>
            <tbody>
              {achats.map((a) => (
                <tr key={a.id} className="border-b border-ink/5">
                  <td className="px-4 py-2">{a.date.toISOString().slice(0, 10)}</td>
                  <td className="px-4 py-2">{a.matiere.nom}</td>
                  <td className="px-4 py-2">
                    {a.quantite} {a.matiere.uniteAchat}
                  </td>
                  <td className="px-4 py-2">{a.prixUnitaire.toFixed(2)} €</td>
                </tr>
              ))}
              {achats.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-ink/50">
                    Aucun achat
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
