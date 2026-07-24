import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CultureNav } from '@/components/culture/CultureNav';
import { getEspece } from '@/services/espece';
import { listLots } from '@/services/lotCulture';

export const dynamic = 'force-dynamic';

export default async function EspeceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  let espece;
  try {
    espece = await getEspece(id);
  } catch {
    notFound();
  }
  const lots = await listLots({ especeId: id, pageSize: 30 });

  return (
    <div>
      <CultureNav current="/culture/especes" />
      <Link href="/culture/especes" className="text-sm text-primary">
        ← Espèces
      </Link>
      <h1 className="mt-2 font-display text-3xl text-primary">{espece.nom}</h1>
      <p className="text-ink/70">
        {espece.cycle ?? 'cycle ?'} · eau {espece.besoinEau ?? '—'}
        {espece.rendementKgHaSec != null && ` · ${espece.rendementKgHaSec} kg/ha sec`}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-3 font-display text-lg text-primary">Itinéraire</h2>
          {espece.itineraires.length === 0 ? (
            <p className="text-sm text-ink/50">
              Aucune étape — à configurer via l&apos;API.
            </p>
          ) : (
            <ol className="list-decimal space-y-1 pl-5 text-sm">
              {espece.itineraires.map((et) => (
                <li key={et.id}>
                  {et.code}
                  {et.libelle ? ` — ${et.libelle}` : ''} (+{et.dureeDepuisPrecedenteJours} j)
                </li>
              ))}
            </ol>
          )}
        </div>
        <div className="card">
          <h2 className="mb-3 font-display text-lg text-primary">Lots</h2>
          <ul className="space-y-1 text-sm">
            {lots.items.map((l) => (
              <li key={l.id}>
                <Link href={`/culture/lots/${l.id}`} className="text-primary">
                  #{l.id} {l.planche.code}
                </Link>{' '}
                · {l.annee} · {l.etat}
              </li>
            ))}
            {lots.items.length === 0 && <li className="text-ink/50">Aucun lot</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
