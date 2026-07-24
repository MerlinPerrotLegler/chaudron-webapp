import Link from 'next/link';
import { PlanifNav } from '@/components/planification/PlanifNav';
import { ActionForm } from '@/components/ui/ActionForm';
import { actionGenererProposition } from '../../actions';

export default function NouvellePropositionPage() {
  const year = new Date().getFullYear();

  return (
    <div>
      <PlanifNav current="/planification/propositions" />
      <Link href="/planification/propositions" className="text-sm text-primary">
        ← Propositions
      </Link>
      <h1 className="mt-2 font-display text-3xl text-primary">Générer une proposition</h1>
      <p className="mb-6 text-sm text-ink/60">
        Archive l&apos;éventuelle proposition active de l&apos;année.
      </p>

      <div className="card max-w-lg">
        <ActionForm action={actionGenererProposition} submitLabel="Générer">
          <div>
            <label className="label" htmlFor="annee">
              Année
            </label>
            <input
              id="annee"
              name="annee"
              type="number"
              className="field"
              defaultValue={year}
              required
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="inclureCommandes" />
            Inclure les commandes confirmées
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="ignorerStock" />
            Ignorer le stock existant
          </label>
          <div>
            <label className="label" htmlFor="notes">
              Notes
            </label>
            <textarea id="notes" name="notes" className="field" rows={2} />
          </div>
        </ActionForm>
      </div>
    </div>
  );
}
