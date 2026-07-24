import Link from 'next/link';
import { CatalogueNav } from '@/components/catalogue/CatalogueNav';
import { ActionForm } from '@/components/ui/ActionForm';
import { actionCreateMatiere } from '../../actions';
import { listEspeces } from '@/services/espece';

export const dynamic = 'force-dynamic';

export default async function NouvelleMatierePage() {
  const especes = await listEspeces({ pageSize: 200 });

  return (
    <div>
      <CatalogueNav current="/catalogue/matieres" />
      <div className="mb-4">
        <Link href="/catalogue/matieres" className="text-sm text-primary">
          ← Matières
        </Link>
        <h1 className="mt-2 font-display text-3xl text-primary">Nouvelle matière</h1>
      </div>

      <div className="card max-w-lg">
        <ActionForm action={actionCreateMatiere} submitLabel="Créer">
          <div>
            <label className="label" htmlFor="nom">
              Nom
            </label>
            <input id="nom" name="nom" className="field" required />
          </div>
          <div>
            <label className="label" htmlFor="nomLatin">
              Nom latin
            </label>
            <input id="nomLatin" name="nomLatin" className="field" />
          </div>
          <div>
            <label className="label" htmlFor="provenance">
              Provenance
            </label>
            <select id="provenance" name="provenance" className="field" defaultValue="base">
              <option value="fermiere">Matière fermière</option>
              <option value="importation">Matière d&apos;importation</option>
              <option value="base">Consommable de base</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="uniteAchat">
              Unité d&apos;achat
            </label>
            <select id="uniteAchat" name="uniteAchat" className="field" defaultValue="kg">
              <option value="kg">kg</option>
              <option value="L">L</option>
              <option value="piece">pièce</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="especeId">
              Espèce (requis si fermière)
            </label>
            <select id="especeId" name="especeId" className="field" defaultValue="">
              <option value="">—</option>
              {especes.items.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nom}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="fournisseur">
              Fournisseur
            </label>
            <input id="fournisseur" name="fournisseur" className="field" />
          </div>
        </ActionForm>
      </div>
    </div>
  );
}
