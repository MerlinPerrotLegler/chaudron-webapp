import Link from 'next/link';
import { CatalogueNav } from '@/components/catalogue/CatalogueNav';
import { ActionForm } from '@/components/ui/ActionForm';
import { actionCreateRecette } from '../../actions';

export default function NouvelleRecettePage() {
  return (
    <div>
      <CatalogueNav current="/catalogue/recettes" />
      <Link href="/catalogue/recettes" className="text-sm text-primary">
        ← Recettes
      </Link>
      <h1 className="mt-2 font-display text-3xl text-primary">Nouvelle recette</h1>

      <div className="card mt-6 max-w-lg">
        <ActionForm action={actionCreateRecette} submitLabel="Créer">
          <div>
            <label className="label" htmlFor="nom">
              Nom
            </label>
            <input id="nom" name="nom" className="field" required />
          </div>
          <div>
            <label className="label" htmlFor="famille">
              Famille
            </label>
            <select id="famille" name="famille" className="field" defaultValue="tisane">
              {[
                'sec',
                'sirop',
                'sel',
                'sucre',
                'vinaigre',
                'lacto',
                'moutarde',
                'tabasco',
                'tisane',
                'cosmetique',
                'autre',
              ].map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="type">
              Type
            </label>
            <select id="type" name="type" className="field" defaultValue="transformation">
              <option value="transformation">Transformation</option>
              <option value="simple">Simple</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="modeQuantite">
              Mode quantité
            </label>
            <select id="modeQuantite" name="modeQuantite" className="field" defaultValue="absolu">
              <option value="absolu">Absolu</option>
              <option value="proportions">Proportions</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="quantiteSortie">
                Quantité sortie
              </label>
              <input
                id="quantiteSortie"
                name="quantiteSortie"
                type="number"
                step="any"
                className="field"
              />
            </div>
            <div>
              <label className="label" htmlFor="uniteSortie">
                Unité sortie
              </label>
              <input id="uniteSortie" name="uniteSortie" className="field" placeholder="kg" />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="description">
              Description
            </label>
            <textarea id="description" name="description" className="field" rows={3} />
          </div>
        </ActionForm>
      </div>
    </div>
  );
}
