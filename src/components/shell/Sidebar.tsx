'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/', label: 'Dashboard' },
  { href: '/catalogue', label: 'Catalogue' },
  { href: '/culture', label: 'Culture' },
  { href: '/stock', label: 'Stock' },
  { href: '/production', label: 'Production' },
  { href: '/commercial', label: 'Commercial' },
  { href: '/planification', label: 'Planification' },
  { href: '/stats', label: 'Stats' },
  { href: '/settings', label: 'Réglages' },
];

export function Sidebar({ appName }: { appName: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-ink/10 bg-primary text-white">
      <div className="border-b border-white/15 px-4 py-5">
        <p className="font-display text-lg leading-tight tracking-tight">{appName}</p>
        <p className="mt-1 text-xs text-white/70">Back-office</p>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-2">
        {NAV.map((item) => {
          const active =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-theme px-3 py-2 text-sm transition ${
                active
                  ? 'bg-white/20 font-semibold'
                  : 'text-white/85 hover:bg-white/10'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3">
        <Link
          href="/storefront"
          className="block rounded-theme bg-accent px-3 py-2.5 text-center text-sm font-semibold text-ink"
        >
          Storefront
        </Link>
      </div>
    </aside>
  );
}
