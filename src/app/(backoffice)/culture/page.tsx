import Link from 'next/link';
import { CultureNav } from '@/components/culture/CultureNav';

export default function CultureHubPage() {
  return (
    <div>
      <CultureNav />
      <header className="mb-6">
        <h1 className="font-display text-3xl text-primary">Culture</h1>
        <p className="mt-1 text-ink/70">Parcelles, planches, espèces, lots et récoltes.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { href: '/culture/parcelles', title: 'Parcelles', desc: 'Codes lettres, vocation' },
          { href: '/culture/planches', title: 'Planches', desc: 'Codes SA-01…' },
          { href: '/culture/especes', title: 'Espèces', desc: 'Itinéraires & rendements' },
          { href: '/culture/lots', title: 'Lots', desc: 'Planning culture année' },
          { href: '/culture/recoltes', title: 'Récoltes', desc: 'Entrée stock matière' },
        ].map((c) => (
          <Link key={c.href} href={c.href} className="card block transition hover:border-primary">
            <h2 className="font-display text-xl text-primary">{c.title}</h2>
            <p className="mt-1 text-sm text-ink/65">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
