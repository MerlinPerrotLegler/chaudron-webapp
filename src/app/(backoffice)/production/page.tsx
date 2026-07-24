import Link from 'next/link';
import { ProductionNav } from '@/components/production/ProductionNav';
import { listProductions } from '@/services/production';
import { listTransformations } from '@/services/transformation';

export const dynamic = 'force-dynamic';

export default async function ProductionHubPage() {
  const [prods, transfos] = await Promise.all([
    listProductions({ pageSize: 5 }),
    listTransformations({ pageSize: 5 }),
  ]);
  const enCours = prods.items.filter((p) => p.statut === 'en_cours').length;

  return (
    <div>
      <ProductionNav />
      <header className="mb-6">
        <h1 className="font-display text-3xl text-primary">Production</h1>
        <p className="mt-1 text-ink/70">
          Transformations matières et lots de produits finis.
        </p>
      </header>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            href: '/production/transformations',
            title: 'Transformations',
            desc: `${transfos.total} opération(s)`,
          },
          {
            href: '/production/lots',
            title: 'Productions',
            desc: `${enCours} en cours · ${prods.total} total`,
          },
          {
            href: '/production/equipements',
            title: 'Équipements',
            desc: 'Sécheur, alambic…',
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
