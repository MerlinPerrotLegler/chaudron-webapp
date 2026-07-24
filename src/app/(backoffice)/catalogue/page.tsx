import Link from 'next/link';
import { CatalogueNav } from '@/components/catalogue/CatalogueNav';

export default function CatalogueHubPage() {
  return (
    <div>
      <CatalogueNav />
      <header className="mb-6">
        <h1 className="font-display text-3xl text-primary">Catalogue</h1>
        <p className="mt-1 text-ink/70">
          Matières, recettes, conditionnements et produits finis.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          {
            href: '/catalogue/matieres',
            title: 'Matières',
            desc: 'Fermières, importation, consommables de base',
          },
          {
            href: '/catalogue/recettes',
            title: 'Recettes',
            desc: 'Ingrédients, étapes, coût',
          },
          {
            href: '/catalogue/conditionnements',
            title: 'Conditionnements',
            desc: 'Pots, sachets, coûts',
          },
          {
            href: '/catalogue/produits',
            title: 'Produits finis',
            desc: 'Recette × conditionnement, prix',
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
