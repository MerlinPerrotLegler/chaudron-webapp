import Link from 'next/link';
import { PlanifNav } from '@/components/planification/PlanifNav';
import { listPropositions } from '@/services/planification';

export const dynamic = 'force-dynamic';

export default async function PlanificationHubPage() {
  const year = new Date().getFullYear();
  const props = await listPropositions(year);
  const active = props.find((p) => p.statut === 'active');

  return (
    <div>
      <PlanifNav />
      <header className="mb-6">
        <h1 className="font-display text-3xl text-primary">Planification</h1>
        <p className="mt-1 text-ink/70">
          Propositions de culture à partir des intentions et besoins.
        </p>
      </header>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/planification/propositions"
          className="card block transition hover:border-primary"
        >
          <h2 className="font-display text-xl text-primary">Propositions {year}</h2>
          <p className="mt-1 text-sm text-ink/65">
            {props.length} version(s)
            {active ? ` · active v${active.version}` : ''}
          </p>
        </Link>
        <Link
          href="/planification/propositions/nouvelle"
          className="card block transition hover:border-primary"
        >
          <h2 className="font-display text-xl text-primary">Générer</h2>
          <p className="mt-1 text-sm text-ink/65">Nouvelle proposition depuis les besoins</p>
        </Link>
      </div>
    </div>
  );
}
