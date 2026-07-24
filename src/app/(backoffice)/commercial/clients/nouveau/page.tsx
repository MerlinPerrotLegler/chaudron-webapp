import Link from 'next/link';
import { CommercialNav } from '@/components/commercial/CommercialNav';
import { ActionForm } from '@/components/ui/ActionForm';
import { actionCreateClient } from '../../actions';

export default function NouveauClientPage() {
  return (
    <div>
      <CommercialNav current="/commercial/clients" />
      <Link href="/commercial/clients" className="text-sm text-primary">
        ← Clients
      </Link>
      <h1 className="mt-2 font-display text-3xl text-primary">Nouveau client</h1>
      <div className="card mt-6 max-w-lg">
        <ActionForm action={actionCreateClient} submitLabel="Créer">
          <div>
            <label className="label" htmlFor="nom">
              Nom
            </label>
            <input id="nom" name="nom" className="field" required />
          </div>
          <div>
            <label className="label" htmlFor="type">
              Type
            </label>
            <select id="type" name="type" className="field" defaultValue="">
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
            <input id="contactNom" name="contactNom" className="field" />
          </div>
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input id="email" name="email" type="email" className="field" />
          </div>
          <div>
            <label className="label" htmlFor="telephone">
              Téléphone
            </label>
            <input id="telephone" name="telephone" className="field" />
          </div>
          <div>
            <label className="label" htmlFor="ville">
              Ville
            </label>
            <input id="ville" name="ville" className="field" />
          </div>
          <div>
            <label className="label" htmlFor="notes">
              Notes
            </label>
            <textarea id="notes" name="notes" className="field" rows={3} />
          </div>
        </ActionForm>
      </div>
    </div>
  );
}
