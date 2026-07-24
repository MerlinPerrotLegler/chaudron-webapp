import Link from 'next/link';
import { CultureNav } from '@/components/culture/CultureNav';
import { ActionForm } from '@/components/ui/ActionForm';
import { actionCreateEspece } from '../../actions';

export default function NouvelleEspecePage() {
  return (
    <div>
      <CultureNav current="/culture/especes" />
      <Link href="/culture/especes" className="text-sm text-primary">
        ← Espèces
      </Link>
      <h1 className="mt-2 font-display text-3xl text-primary">Nouvelle espèce</h1>
      <div className="card mt-6 max-w-lg">
        <ActionForm action={actionCreateEspece} submitLabel="Créer">
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
            <label className="label" htmlFor="cycle">
              Cycle
            </label>
            <select id="cycle" name="cycle" className="field" defaultValue="">
              <option value="">—</option>
              <option value="annuelle">Annuelle</option>
              <option value="bisannuelle">Bisannuelle</option>
              <option value="vivace">Vivace</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="besoinEau">
              Besoin eau
            </label>
            <select id="besoinEau" name="besoinEau" className="field" defaultValue="">
              <option value="">—</option>
              <option value="faible">Faible</option>
              <option value="modere">Modéré</option>
              <option value="eleve">Élevé</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="rendementKgHaSec">
              Rendement kg/ha sec
            </label>
            <input
              id="rendementKgHaSec"
              name="rendementKgHaSec"
              type="number"
              step="any"
              className="field"
            />
          </div>
        </ActionForm>
      </div>
    </div>
  );
}
