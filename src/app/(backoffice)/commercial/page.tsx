import Link from 'next/link';
import { CommercialNav } from '@/components/commercial/CommercialNav';

export default function CommercialHubPage() {
  return (
    <div>
      <CommercialNav />
      <header className="mb-6">
        <h1 className="font-display text-3xl text-primary">Commercial</h1>
        <p className="mt-1 text-ink/70">Clients, canaux, commandes et ventes.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { href: '/commercial/clients', title: 'Clients', desc: 'Fiches et historique' },
          {
            href: '/commercial/points-vente',
            title: 'Points de vente',
            desc: 'Canaux et dates de livraison',
          },
          {
            href: '/commercial/commandes',
            title: 'Commandes',
            desc: 'Cycle brouillon → livrée',
          },
          {
            href: '/commercial/ventes',
            title: 'Ventes',
            desc: 'Directes et via commande',
          },
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
