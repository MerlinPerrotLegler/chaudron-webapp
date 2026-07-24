import Link from 'next/link';
import { StockNav } from '@/components/stock/StockNav';
import { listAlertesStock } from '@/services/stock';

export const dynamic = 'force-dynamic';

export default async function StockHubPage() {
  const alertes = await listAlertesStock();

  return (
    <div>
      <StockNav />
      <header className="mb-6">
        <h1 className="font-display text-3xl text-primary">Stock</h1>
        <p className="mt-1 text-ink/70">Soldes, achats, emplacements et alertes DLUO.</p>
      </header>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { href: '/stock/alertes', title: 'Alertes', desc: `${alertes.length} alerte(s)` },
          { href: '/stock/matieres', title: 'Matières', desc: 'Soldes & mini' },
          { href: '/stock/produits', title: 'Produits', desc: 'Unités en stock' },
          { href: '/stock/achats', title: 'Achats', desc: 'Entrées matières' },
          { href: '/stock/emplacements', title: 'Emplacements', desc: 'Lieux de stockage' },
        ].map((c) => (
          <Link key={c.href} href={c.href} className="card block transition hover:border-primary">
            <h2 className="font-display text-xl text-primary">{c.title}</h2>
            <p className="mt-1 text-sm text-ink/65">{c.desc}</p>
          </Link>
        ))}
      </div>

      {alertes.length > 0 && (
        <div className="card border-accent/40 bg-accent/10">
          <h2 className="mb-2 font-display text-lg text-primary">Alertes en cours</h2>
          <ul className="space-y-1 text-sm">
            {alertes.slice(0, 5).map((a, i) => (
              <li key={i}>
                <span className="font-medium">{a.code}</span> — {a.message}
              </li>
            ))}
          </ul>
          {alertes.length > 5 && (
            <Link href="/stock/alertes" className="mt-2 inline-block text-sm text-primary">
              Voir toutes →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
