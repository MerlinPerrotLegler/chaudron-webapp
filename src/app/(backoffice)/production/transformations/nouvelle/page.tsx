import Link from 'next/link';
import { ProductionNav } from '@/components/production/ProductionNav';
import { ActionForm } from '@/components/ui/ActionForm';
import { actionDeclareTransformation } from '../../actions';
import { listMatieres } from '@/services/matiere';
import { listEmplacements } from '@/services/stock';

export const dynamic = 'force-dynamic';

export default async function NouvelleTransformationPage() {
  const [matieres, emplacements] = await Promise.all([
    listMatieres({ pageSize: 200 }),
    listEmplacements(),
  ]);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <ProductionNav current="/production/transformations" />
      <Link href="/production/transformations" className="text-sm text-primary">
        ← Transformations
      </Link>
      <h1 className="mt-2 font-display text-3xl text-primary">Déclarer une transformation</h1>
      <p className="mb-6 text-sm text-ink/60">
        Sortie matière(s) + entrée matière résultante (ex. séchage).
      </p>

      <div className="card max-w-lg">
        <ActionForm action={actionDeclareTransformation} submitLabel="Enregistrer">
          <div>
            <label className="label" htmlFor="type">
              Type
            </label>
            <select id="type" name="type" className="field" defaultValue="sechage">
              {(
                [
                  'sechage',
                  'distillation',
                  'mondage',
                  'congelation',
                  'torrefaction',
                  'autre',
                ] as const
              ).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="date">
              Date
            </label>
            <input id="date" name="date" type="date" className="field" defaultValue={today} required />
          </div>
          <div>
            <label className="label" htmlFor="matiereInId">
              Matière entrante
            </label>
            <select id="matiereInId" name="matiereInId" className="field" required>
              {matieres.items.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nom}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="quantiteIn">
              Quantité entrante
            </label>
            <input
              id="quantiteIn"
              name="quantiteIn"
              type="number"
              step="any"
              min="0.001"
              className="field"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="matiereOutId">
              Matière sortante
            </label>
            <select id="matiereOutId" name="matiereOutId" className="field" required>
              {matieres.items.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nom}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="quantiteOut">
              Quantité sortante
            </label>
            <input
              id="quantiteOut"
              name="quantiteOut"
              type="number"
              step="any"
              min="0.001"
              className="field"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="emplacementOutId">
              Emplacement sortie
            </label>
            <select id="emplacementOutId" name="emplacementOutId" className="field" defaultValue="">
              <option value="">—</option>
              {emplacements.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nom}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="datePeremptionOut">
              DLUO sortie
            </label>
            <input id="datePeremptionOut" name="datePeremptionOut" type="date" className="field" />
          </div>
          <div>
            <label className="label" htmlFor="operateurNom">
              Opérateur
            </label>
            <input id="operateurNom" name="operateurNom" className="field" />
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
