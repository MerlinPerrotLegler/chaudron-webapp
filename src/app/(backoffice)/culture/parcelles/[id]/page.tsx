import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CultureNav } from '@/components/culture/CultureNav';
import { ActionForm } from '@/components/ui/ActionForm';
import { actionCreatePlanche } from '../../actions';
import { getParcelle } from '@/services/parcelle';
import { listPlanches } from '@/services/planche';

export const dynamic = 'force-dynamic';

export default async function ParcelleDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  let parcelle;
  try {
    parcelle = await getParcelle(id);
  } catch {
    notFound();
  }
  const planches = await listPlanches({ parcelleId: id, pageSize: 100 });

  return (
    <div>
      <CultureNav current="/culture/parcelles" />
      <Link href="/culture/parcelles" className="text-sm text-primary">
        ← Parcelles
      </Link>
      <h1 className="mt-2 font-display text-3xl text-primary">Parcelle {parcelle.code}</h1>
      <p className="text-ink/70">{parcelle.vocation}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card overflow-x-auto p-0">
          <h2 className="border-b border-ink/10 px-4 py-3 font-display text-lg text-primary">
            Planches
          </h2>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink/10 bg-canvas text-ink/60">
              <tr>
                <th className="px-4 py-2 font-medium">Code</th>
                <th className="px-4 py-2 font-medium">Surface</th>
              </tr>
            </thead>
            <tbody>
              {planches.items.map((pl) => (
                <tr key={pl.id} className="border-b border-ink/5">
                  <td className="px-4 py-2">
                    <Link href={`/culture/planches/${pl.id}`} className="text-primary">
                      {pl.code}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{pl.surfaceM2} m²</td>
                </tr>
              ))}
              {planches.items.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-4 py-6 text-center text-ink/50">
                    Aucune planche
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h2 className="mb-3 font-display text-lg text-primary">Ajouter une planche</h2>
          <ActionForm action={actionCreatePlanche} submitLabel="Créer">
            <input type="hidden" name="parcelleId" value={id} />
            <div>
              <label className="label" htmlFor="numero">
                Numéro (2–3 chiffres)
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
