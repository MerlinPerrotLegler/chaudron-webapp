import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CommercialNav } from '@/components/commercial/CommercialNav';
import { ActionForm } from '@/components/ui/ActionForm';
import {
  actionUpdatePointVente,
  actionArchivePointVente,
  actionAddDateLivraison,
} from '../../actions';
import {
  getPointVente,
  listDatesLivraison,
} from '@/services/pointVente';

export const dynamic = 'force-dynamic';

export default async function PointVenteDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  let pdv;
  try {
    pdv = await getPointVente(id);
  } catch {
    notFound();
  }
  const dates = await listDatesLivraison(id);
  const update = actionUpdatePointVente.bind(null, id);
  const addDate = actionAddDateLivraison.bind(null, id);

  return (
    <div>
      <CommercialNav current="/commercial/points-vente" />
      <Link href="/commercial/points-vente" className="text-sm text-primary">
        ← Points de vente
      </Link>
      <h1 className="mt-2 font-display text-3xl text-primary">{pdv.nom}</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-3 font-display text-lg text-primary">Modifier</h2>
          <ActionForm action={update} submitLabel="Enregistrer">
            <div>
              <label className="label" htmlFor="nom">
                Nom
              </label>
              <input id="nom" name="nom" className="field" defaultValue={pdv.nom} required />
            </div>
            <div>
              <label className="label" htmlFor="type">
                Type
              </label>
              <select id="type" name="type" className="field" defaultValue={pdv.type}>
                <option value="ferme">Ferme</option>
                <option value="marche">Marché</option>
                <option value="boutique_producteur">Boutique producteur</option>
                <option value="demi_gros">Demi-gros</option>
                <option value="tournee">Tournée</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="contact">
                Contact
              </label>
              <input
                id="contact"
                name="contact"
                className="field"
                defaultValue={pdv.contact ?? ''}
              />
            </div>
            <div>
              <label className="label" htmlFor="notes">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                className="field"
                rows={2}
                defaultValue={pdv.notes ?? ''}
              />
            </div>
          </ActionForm>
          <form action={actionArchivePointVente.bind(null, id)} className="mt-4">
            <button type="submit" className="btn-ghost text-red-700">
              Archiver
            </button>
          </form>
        </div>

        <div className="card">
          <h2 className="mb-3 font-display text-lg text-primary">Dates de livraison</h2>
          <ul className="mb-4 space-y-1 text-sm">
            {dates.map((d) => (
              <li key={d.date.toISOString()}>
                {d.date.toISOString().slice(0, 10)}
                {d.notes ? ` — ${d.notes}` : ''}
              </li>
            ))}
            {dates.length === 0 && (
              <li className="text-ink/50">Aucune date ponctuelle</li>
            )}
          </ul>
          <ActionForm action={addDate} submitLabel="Ajouter">
            <div>
              <label className="label" htmlFor="date">
                Date
              </label>
              <input id="date" name="date" type="date" className="field" required />
            </div>
            <div>
              <label className="label" htmlFor="notes">
                Notes
              </label>
              <input id="notes" name="notes" className="field" />
            </div>
          </ActionForm>
        </div>
      </div>
    </div>
  );
}
