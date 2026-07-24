import Link from 'next/link';

const LINKS = [
  { href: '/stock/alertes', label: 'Alertes' },
  { href: '/stock/matieres', label: 'Soldes matières' },
  { href: '/stock/produits', label: 'Soldes produits' },
  { href: '/stock/achats', label: 'Achats' },
  { href: '/stock/emplacements', label: 'Emplacements' },
];

export function StockNav({ current }: { current?: string }) {
  return (
    <nav className="mb-6 flex flex-wrap gap-2 border-b border-ink/10 pb-3">
      <Link
        href="/stock"
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
    </nav>
  );
}
