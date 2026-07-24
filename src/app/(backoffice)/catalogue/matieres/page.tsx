import Link from 'next/link';
import { CatalogueNav } from '@/components/catalogue/CatalogueNav';
import { listMatieres } from '@/services/matiere';

export const dynamic = 'force-dynamic';

const PROV: Record<string, string> = {
  fermiere: 'Fermière',
  importation: 'Importation',
  base: 'Base',
};

export default async function MatieresPage({
  searchParams,
}: {
  searchParams?: { provenance?: string };
}) {
  const provenance = searchParams?.provenance as
    | 'fermiere'
    | 'importation'
    | 'base'
    | undefined;
  const { items, total } = await listMatieres({
    provenance,
    pageSize: 100,
  });

  return (
    <div>
      <CatalogueNav current="/catalogue/matieres" />
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-primary">Matières</h1>
          <p className="text-sm text-ink/60">{total} matière(s)</p>
        </div>
        <Link href="/catalogue/matieres/nouvelle" className="btn-primary">
          Nouvelle matière
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <FilterLink href="/catalogue/matieres" active={!provenance} label="Toutes" />
        <FilterLink
          href="/catalogue/matieres?provenance=fermiere"
          active={provenance === 'fermiere'}
          label="Fermières"
        />
        <FilterLink
          href="/catalogue/matieres?provenance=importation"
          active={provenance === 'importation'}
          label="Importation"
        />
        <FilterLink
          href="/catalogue/matieres?provenance=base"
          active={provenance === 'base'}
          label="Base"
        />
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 bg-canvas text-ink/60">
            <tr>
              <th className="px-4 py-2 font-medium">Nom</th>
              <th className="px-4 py-2 font-medium">Provenance</th>
              <th className="px-4 py-2 font-medium">Unité</th>
            </tr>
          </thead>
          <tbody>
            {items.map((m) => (
              <tr key={m.id} className="border-b border-ink/5 hover:bg-primary/5">
                <td className="px-4 py-2">
                  <Link href={`/catalogue/matieres/${m.id}`} className="font-medium text-primary">
                    {m.nom}
                  </Link>
                </td>
                <td className="px-4 py-2">{PROV[m.provenance] ?? m.provenance}</td>
                <td className="px-4 py-2">{m.uniteAchat}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-ink/50">
                  Aucune matière — créez-en une.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterLink({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`rounded-theme px-3 py-1 ${
        active ? 'bg-accent/40 font-medium' : 'border border-ink/10 hover:bg-ink/5'
      }`}
    >
      {label}
    </Link>
  );
}
