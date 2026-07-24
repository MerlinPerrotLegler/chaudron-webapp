import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CatalogueNav } from '@/components/catalogue/CatalogueNav';
import { ActionForm } from '@/components/ui/ActionForm';
import { actionArchiveMatiere, actionUpdateMatiere } from '../../actions';
import { getMatiere, getMatiereUsages } from '@/services/matiere';

export const dynamic = 'force-dynamic';

export default async function MatiereDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  let m;
  try {
    m = await getMatiere(id);
  } catch {
    notFound();
  }
  const usages = await getMatiereUsages(id);
  const update = actionUpdateMatiere.bind(null, id);

  return (
    <div>
      <CatalogueNav current="/catalogue/matieres" />
      <Link href="/catalogue/matieres" className="text-sm text-primary">
        ← Matières
      </Link>
      <h1 className="mt-2 font-display text-3xl text-primary">{m.nom}</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-3 font-display text-lg text-primary">Modifier</h2>
          <ActionForm action={update} submitLabel="Enregistrer">
            <div>
              <label className="label" htmlFor="nom">
                Nom
              </label>
              <input id="nom" name="nom" className="field" defaultValue={m.nom} required />
            </div>
            <div>
              <label className="label" htmlFor="nomLatin">
                Nom latin
              </label>
              <input
                id="nomLatin"
                name="nomLatin"
                className="field"
                defaultValue={m.nomLatin ?? ''}
              />
            </div>
            <div>
              <label className="label" htmlFor="provenance">
                Provenance
              </label>
              <select
                id="provenance"
                name="provenance"
                className="field"
                defaultValue={m.provenance}
              >
                <option value="fermiere">Matière fermière</option>
                <option value="importation">Matière d&apos;importation</option>
                <option value="base">Consommable de base</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="uniteAchat">
                Unité
              </label>
              <select
                id="uniteAchat"
                name="uniteAchat"
                className="field"
                defaultValue={m.uniteAchat}
              >
                <option value="kg">kg</option>
                <option value="L">L</option>
                <option value="piece">pièce</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="fournisseur">
                Fournisseur
              </label>
              <input
                id="fournisseur"
                name="fournisseur"
                className="field"
                defaultValue={m.fournisseur ?? ''}
              />
            </div>
          </ActionForm>
        </div>

        <div className="space-y-4">
          <div className="card">
            <h2 className="mb-2 font-display text-lg text-primary">Usages</h2>
            {usages.recettes.length === 0 ? (
              <p className="text-sm text-ink/50">Aucune recette active</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {usages.recettes.map((r) => (
                  <li key={r.id}>
                    <Link href={`/catalogue/recettes/${r.id}`} className="text-primary">
                      {r.nom}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <form action={actionArchiveMatiere.bind(null, id)}>
            <button type="submit" className="btn-ghost text-red-700">
              Archiver
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
