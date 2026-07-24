import Link from 'next/link';
import { CultureNav } from '@/components/culture/CultureNav';
import { ActionForm } from '@/components/ui/ActionForm';
import { actionCreateLot } from '../../actions';
import { listEspeces } from '@/services/espece';
import { listPlanches } from '@/services/planche';

export const dynamic = 'force-dynamic';

export default async function NouveauLotPage() {
  const [especes, planches] = await Promise.all([
    listEspeces({ pageSize: 200 }),
    listPlanches({ pageSize: 200 }),
  ]);
  const year = new Date().getFullYear();

  return (
    <div>
      <CultureNav current="/culture/lots" />
      <Link href="/culture/lots" className="text-sm text-primary">
        ← Lots
      </Link>
      <h1 className="mt-2 font-display text-3xl text-primary">Nouveau lot</h1>
      <div className="card mt-6 max-w-lg">
        <ActionForm action={actionCreateLot} submitLabel="Créer">
          <div>
            <label className="label" htmlFor="especeId">
              Espèce
            </label>
            <select id="especeId" name="especeId" className="field" required>
              {especes.items.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nom}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="plancheId">
              Planche
            </label>
            <select id="plancheId" name="plancheId" className="field" required>
              {planches.items.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} ({p.surfaceM2} m²)
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="annee">
                Année
              </label>
              <input
                id="annee"
                name="annee"
                type="number"
                className="field"
                defaultValue={year}
                required
              />
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
          </div>
          <div>
            <label className="label" htmlFor="priorite">
              Priorité
            </label>
            <select id="priorite" name="priorite" className="field" defaultValue="P2">
              <option value="P1">P1</option>
              <option value="P2">P2</option>
              <option value="P3">P3</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="dateDebut">
              Date début (cascade)
            </label>
            <input id="dateDebut" name="dateDebut" type="date" className="field" />
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
