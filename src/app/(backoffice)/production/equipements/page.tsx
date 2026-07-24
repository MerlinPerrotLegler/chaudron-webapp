import { ProductionNav } from '@/components/production/ProductionNav';
import { ActionForm } from '@/components/ui/ActionForm';
import { actionCreateEquipement } from '../actions';
import { listEquipements } from '@/services/equipement';

export const dynamic = 'force-dynamic';

export default async function EquipementsPage() {
  const items = await listEquipements();

  return (
    <div>
      <ProductionNav current="/production/equipements" />
      <h1 className="font-display text-3xl text-primary">Équipements</h1>
      <p className="mb-6 text-sm text-ink/60">{items.length} équipement(s)</p>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink/10 bg-canvas text-ink/60">
              <tr>
                <th className="px-4 py-2 font-medium">Nom</th>
              </tr>
            </thead>
            <tbody>
              {items.map((e) => (
                <tr key={e.id} className="border-b border-ink/5">
                  <td className="px-4 py-2">{e.nom}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-ink/50">Aucun équipement</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h2 className="mb-3 font-display text-lg text-primary">Nouvel équipement</h2>
          <ActionForm action={actionCreateEquipement} submitLabel="Créer">
            <div>
              <label className="label" htmlFor="nom">
                Nom
              </label>
              <input id="nom" name="nom" className="field" required />
            </div>
          </ActionForm>
        </div>
      </div>
    </div>
  );
}
