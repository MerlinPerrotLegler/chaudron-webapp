import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PlanifNav } from '@/components/planification/PlanifNav';
import { PropositionActions } from '@/components/planification/PropositionActions';
import { ActionForm } from '@/components/ui/ActionForm';
import { actionPatchLigne } from '../../actions';
import {
  couvertureProposition,
  getProposition,
} from '@/services/planification';
import { listPlanches } from '@/services/planche';

export const dynamic = 'force-dynamic';

function faisabiliteClass(f: string) {
  if (f === 'vert') return 'text-emerald-700';
  if (f === 'jaune') return 'text-amber-700';
  if (f === 'rouge' || f === 'non_place') return 'text-red-700';
  return '';
}

export default async function PropositionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  let prop;
  try {
    prop = await getProposition(id);
  } catch {
    notFound();
  }
  const [couverture, planches] = await Promise.all([
    couvertureProposition(id),
    listPlanches({ pageSize: 200 }),
  ]);
  const covByLigne = new Map(couverture.map((c) => [c.ligneId, c]));
  const editable = prop.statut === 'active' || prop.statut === 'brouillon';

  return (
    <div>
      <PlanifNav current="/planification/propositions" />
      <Link href="/planification/propositions" className="text-sm text-primary">
        ← Propositions
      </Link>
      <h1 className="mt-2 font-display text-3xl text-primary">
        Proposition {prop.annee} v{prop.version}
      </h1>
      <p className="text-ink/70">
        <span className="font-medium text-primary">{prop.statut}</span>
        {prop.notes ? ` · ${prop.notes}` : ''}
      </p>

      <div className="card mt-6 overflow-x-auto p-0">
        <h2 className="border-b border-ink/10 px-4 py-3 font-display text-lg text-primary">
          Lignes
        </h2>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 bg-canvas text-ink/60">
            <tr>
              <th className="px-3 py-2 font-medium">Espèce</th>
              <th className="px-3 py-2 font-medium">Besoin</th>
              <th className="px-3 py-2 font-medium">Stock</th>
              <th className="px-3 py-2 font-medium">Surface</th>
              <th className="px-3 py-2 font-medium">Planche</th>
              <th className="px-3 py-2 font-medium">Faisab.</th>
              <th className="px-3 py-2 font-medium">Couverture</th>
              {editable && <th className="px-3 py-2 font-medium">Édit</th>}
            </tr>
          </thead>
          <tbody>
            {prop.lignes.map((l) => {
              const cov = covByLigne.get(l.id);
              return (
                <tr key={l.id} className="border-b border-ink/5 align-top">
                  <td className="px-3 py-2">
                    {l.espece?.nom ?? '—'}
                    <div className="text-xs text-ink/50">{l.priorite}</div>
                  </td>
                  <td className="px-3 py-2">{l.besoinKgBrut.toFixed(1)} kg</td>
                  <td className="px-3 py-2">{l.stockKg.toFixed(1)} kg</td>
                  <td className="px-3 py-2">
                    {l.surfaceM2 != null ? `${l.surfaceM2} m²` : '—'}
                  </td>
                  <td className="px-3 py-2">{l.planche?.code ?? '—'}</td>
                  <td className={`px-3 py-2 ${faisabiliteClass(l.faisabilite)}`}>
                    {l.faisabilite}
                  </td>
                  <td className="px-3 py-2">
                    {cov ? (
                      <span
                        className={
                          cov.statut === 'manque'
                            ? 'text-red-700'
                            : cov.statut === 'surplus'
                              ? 'text-amber-700'
                              : 'text-emerald-700'
                        }
                      >
                        {cov.statut} ({cov.ecart.toFixed(1)} kg)
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  {editable && (
                    <td className="px-3 py-2">
                      <details>
                        <summary className="cursor-pointer text-primary">Ajuster</summary>
                        <div className="mt-2 min-w-[14rem]">
                          <ActionForm
                            action={actionPatchLigne}
                            submitLabel="OK"
                            className="space-y-2"
                          >
                            <input type="hidden" name="propositionId" value={prop.id} />
                            <input type="hidden" name="ligneId" value={l.id} />
                            <input
                              name="surfaceM2"
                              type="number"
                              step="any"
                              min="0.01"
                              className="field"
                              placeholder="m²"
                              defaultValue={l.surfaceM2 ?? ''}
                            />
                            <select
                              name="plancheId"
                              className="field"
                              defaultValue={l.plancheId ?? ''}
                            >
                              <option value="">— hors place</option>
                              {planches.items.map((pl) => (
                                <option key={pl.id} value={pl.id}>
                                  {pl.code}
                                </option>
                              ))}
                            </select>
                          </ActionForm>
                        </div>
                      </details>
                    </td>
                  )}
                </tr>
              );
            })}
            {prop.lignes.length === 0 && (
              <tr>
                <td colSpan={editable ? 8 : 7} className="px-4 py-6 text-center text-ink/50">
                  Aucune ligne (pas de besoins fermiers ?)
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card mt-6">
        <h2 className="mb-3 font-display text-lg text-primary">Actions</h2>
        <PropositionActions id={prop.id} statut={prop.statut} />
      </div>
    </div>
  );
}
