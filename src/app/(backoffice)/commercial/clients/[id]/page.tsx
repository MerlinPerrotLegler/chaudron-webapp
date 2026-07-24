import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CommercialNav } from '@/components/commercial/CommercialNav';
import { ActionForm } from '@/components/ui/ActionForm';
import {
  actionArchiveClient,
  actionUpdateClient,
  actionAddClientNote,
} from '../../actions';
import { getClient, getClientHistorique } from '@/services/client';

export const dynamic = 'force-dynamic';

export default async function ClientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  let client;
  try {
    client = await getClient(id);
  } catch {
    notFound();
  }
  const histo = await getClientHistorique(id);
  const update = actionUpdateClient.bind(null, id);
  const addNote = actionAddClientNote.bind(null, id);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <CommercialNav current="/commercial/clients" />
      <Link href="/commercial/clients" className="text-sm text-primary">
        ← Clients
      </Link>
      <h1 className="mt-2 font-display text-3xl text-primary">{client.nom}</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-3 font-display text-lg text-primary">Fiche</h2>
          <ActionForm action={update} submitLabel="Enregistrer">
            <div>
              <label className="label" htmlFor="nom">
                Nom
              </label>
              <input id="nom" name="nom" className="field" defaultValue={client.nom} required />
            </div>
            <div>
              <label className="label" htmlFor="type">
                Type
              </label>
              <select id="type" name="type" className="field" defaultValue={client.type ?? ''}>
                <option value="">—</option>
                <option value="particulier">Particulier</option>
                <option value="professionnel">Professionnel</option>
                <option value="association">Association</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="contactNom">
                Contact
              </label>
              <input
                id="contactNom"
                name="contactNom"
                className="field"
                defaultValue={client.contactNom ?? ''}
              />
            </div>
            <div>
              <label className="label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="field"
                defaultValue={client.email ?? ''}
              />
            </div>
            <div>
              <label className="label" htmlFor="telephone">
                Téléphone
              </label>
              <input
                id="telephone"
                name="telephone"
                className="field"
                defaultValue={client.telephone ?? ''}
              />
            </div>
            <div>
              <label className="label" htmlFor="ville">
                Ville
              </label>
              <input id="ville" name="ville" className="field" defaultValue={client.ville ?? ''} />
            </div>
            <div>
              <label className="label" htmlFor="notes">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                className="field"
                rows={3}
                defaultValue={client.notes ?? ''}
              />
            </div>
          </ActionForm>
          <form action={actionArchiveClient.bind(null, id)} className="mt-4">
            <button type="submit" className="btn-ghost text-red-700">
              Archiver
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <div className="card">
            <h2 className="mb-3 font-display text-lg text-primary">Ajouter une note</h2>
            <ActionForm action={addNote} submitLabel="Ajouter">
              <input type="hidden" name="date" value={today} />
              <div>
                <label className="label" htmlFor="texte">
                  Texte
                </label>
                <textarea id="texte" name="texte" className="field" rows={3} required />
              </div>
            </ActionForm>
          </div>
          <div className="card">
            <h2 className="mb-3 font-display text-lg text-primary">Historique</h2>
            {histo.length === 0 ? (
              <p className="text-sm text-ink/50">Vide</p>
            ) : (
              <ul className="max-h-96 space-y-2 overflow-y-auto text-sm">
                {histo.map((e) => (
                  <li key={`${e.type}-${e.ref_id}-${e.date}`} className="border-b border-ink/5 pb-2">
                    <span className="text-ink/50">{e.date}</span>{' '}
                    <span className="rounded bg-primary/10 px-1.5 text-xs text-primary">
                      {e.type}
                    </span>
                    <p className="mt-0.5">{e.libelle}</p>
                    {e.montant != null && (
                      <p className="text-ink/60">{e.montant.toFixed(2)} €</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
