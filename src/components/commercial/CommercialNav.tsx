import Link from 'next/link';

const LINKS = [
  { href: '/commercial/clients', label: 'Clients' },
  { href: '/commercial/points-vente', label: 'Points de vente' },
  { href: '/commercial/commandes', label: 'Commandes' },
  { href: '/commercial/ventes', label: 'Ventes' },
];

export function CommercialNav({ current }: { current?: string }) {
  return (
    <nav className="mb-6 flex flex-wrap gap-2 border-b border-ink/10 pb-3">
      <Link
        href="/commercial"
        className={`rounded-theme px-3 py-1.5 text-sm ${
          !current ? 'bg-primary text-white' : 'border border-ink/15 hover:bg-primary/5'
        }`}
      >
        Hub
      </Link>
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={`rounded-theme px-3 py-1.5 text-sm ${
            current === l.href
              ? 'bg-primary text-white'
              : 'border border-ink/15 hover:bg-primary/5'
          }`}
        >
          {l.label}
        </Link>
      ))}
      <Link
        href="/storefront"
        className="rounded-theme bg-accent px-3 py-1.5 text-sm font-medium text-ink"
      >
        Storefront
      </Link>
    </nav>
  );
}
