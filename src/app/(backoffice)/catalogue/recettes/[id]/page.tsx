import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CatalogueNav } from '@/components/catalogue/CatalogueNav';
import { getRecette } from '@/services/recette';
import { listIngredients } from '@/services/recetteIngredient';
import { actionArchiveRecette } from '../../actions';

export const dynamic = 'force-dynamic';

export default async function RecetteDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  let r;
  try {
    r = await getRecette(id);
  } catch {
    notFound();
  }
  const ingredients = await listIngredients(id);

  return (
    <div>
      <CatalogueNav current="/catalogue/recettes" />
      <Link href="/catalogue/recettes" className="text-sm text-primary">
        ← Recettes
      </Link>
      <h1 className="mt-2 font-display text-3xl text-primary">{r.nom}</h1>
      <p className="text-ink/65">
        {r.famille} · {r.type} · mode {r.modeQuantite}
        {r.quantiteSortie != null && ` · sortie ${r.quantiteSortie} ${r.uniteSortie ?? ''}`}
      </p>

      <div className="card mt-6">
        <h2 className="mb-3 font-display text-lg text-primary">Ingrédients</h2>
        {ingredients.length === 0 ? (
          <p className="text-sm text-ink/50">
            Aucun ingrédient — à ajouter via l&apos;API pour l&apos;instant.
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {ingredients.map((ing) => (
              <li key={ing.id} className="flex justify-between border-b border-ink/5 py-1">
                <Link href={`/catalogue/matieres/${ing.matiereId}`} className="text-primary">
                  {ing.matiere.nom}
                </Link>
                <span>
                  {ing.quantite} {ing.unite}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form action={actionArchiveRecette.bind(null, id)} className="mt-4">
        <button type="submit" className="btn-ghost text-red-700">
          Archiver
        </button>
      </form>
    </div>
  );
}
