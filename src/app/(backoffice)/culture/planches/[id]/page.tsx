import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CultureNav } from '@/components/culture/CultureNav';
import { getPlanche } from '@/services/planche';
import { listLots } from '@/services/lotCulture';
import { getHistoriquePlanche } from '@/services/plancheJournal';

export const dynamic = 'force-dynamic';

export default async function PlancheDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  let planche;
  try {
    planche = await getPlanche(id);
  } catch {
    notFound();
  }
  const [lots, histo] = await Promise.all([
    listLots({ plancheId: id, pageSize: 50 }),
    getHistoriquePlanche(id),
  ]);

  return (
    <div>
      <CultureNav current="/culture/planches" />
      <Link href="/culture/planches" className="text-sm text-primary">
        ← Planches
      </Link>
      <h1 className="mt-2 font-display text-3xl text-primary">{planche.code}</h1>
      <p className="text-ink/70">{planche.surfaceM2} m²</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-3 font-display text-lg text-primary">Lots</h2>
          <ul className="space-y-2 text-sm">
            {lots.items.map((l) => (
              <li key={l.id}>
                <Link href={`/culture/lots/${l.id}`} className="text-primary">
                  #{l.id} {l.espece.nom}
                </Link>{' '}
                · {l.annee} · {l.surfaceM2} m² · {l.etat}
              </li>
            ))}
            {lots.items.length === 0 && (
              <li className="text-ink/50">Aucun lot</li>
            )}
          </ul>
          <Link href="/culture/lots/nouveau" className="btn-ghost mt-3 inline-flex">
            Nouveau lot
          </Link>
        </div>
        <div className="card">
          <h2 className="mb-3 font-display text-lg text-primary">Journal</h2>
          <ul className="max-h-80 space-y-2 overflow-y-auto text-sm">
            {histo.travaux.map((t) => (
              <li key={`t-${t.id}`} className="border-b border-ink/5 pb-1">
                <span className="text-ink/50">{t.date.toISOString().slice(0, 10)}</span> ·
                travail sol
                <p>{t.type}</p>
              </li>
            ))}
            {histo.entrants.map((e) => (
              <li key={`e-${e.id}`} className="border-b border-ink/5 pb-1">
                <span className="text-ink/50">{e.date.toISOString().slice(0, 10)}</span> ·
                entrant
                <p>
                  {e.type} — {e.produit}
                </p>
              </li>
            ))}
            {histo.jours.map((j) => (
              <li
                key={`j-${j.date.toISOString()}`}
                className="border-b border-ink/5 pb-1"
              >
                <span className="text-ink/50">{j.date.toISOString().slice(0, 10)}</span> · jour
                <p>{j.notes}</p>
              </li>
            ))}
            {histo.travaux.length + histo.entrants.length + histo.jours.length === 0 && (
              <li className="text-ink/50">Vide</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
