import Link from 'next/link';
import { getDashboard } from '@/services/dashboard';

export default async function DashboardPage() {
  let data: Awaited<ReturnType<typeof getDashboard>> | null = null;
  let error: string | null = null;
  try {
    data = await getDashboard();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Impossible de charger le tableau de bord';
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl text-primary">Tableau de bord</h1>
        <p className="mt-1 text-ink/70">Vue du jour — stock, production, culture, livraisons.</p>
      </header>

      {error && (
        <div className="card border-red-200 bg-red-50 text-red-800">{error}</div>
      )}

      <div className="flex flex-wrap gap-2">
        <Link href="/storefront" className="btn-primary">
          Nouvelle vente
        </Link>
        <Link href="/culture" className="btn-ghost">
          Culture
        </Link>
        <Link href="/stock" className="btn-ghost">
          Stock
        </Link>
      </div>

      {data && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
          <Widget title="Alertes stock / DLUO">
            {data.alertesStock.length === 0 ? (
              <Empty>Aucune alerte</Empty>
            ) : (
              <ul className="space-y-2 text-sm">
                {data.alertesStock.slice(0, 8).map((a, i) => (
                  <li key={i} className="rounded-theme bg-accent/15 px-2 py-1.5">
                    <span className="font-medium">{a.code}</span> — {a.message}
                  </li>
                ))}
              </ul>
            )}
          </Widget>

          <Widget title="Productions en cours">
            {data.productionsEnCours.length === 0 ? (
              <Empty>Rien en cours</Empty>
            ) : (
              <ul className="space-y-2 text-sm">
                {data.productionsEnCours.map((p) => (
                  <li key={p.id}>
                    {p.recette.nom} · lot {p.numeroLot}
                  </li>
                ))}
              </ul>
            )}
          </Widget>

          <Widget title="Étapes culture (7 jours)">
            {data.etapesCultureAVenir.length === 0 ? (
              <Empty>Aucune étape à venir</Empty>
            ) : (
              <ul className="space-y-2 text-sm">
                {data.etapesCultureAVenir.map((e) => (
                  <li key={e.id}>
                    {e.lot.espece.nom} · {e.lot.planche.code} ·{' '}
                    {e.datePrevue?.toISOString().slice(0, 10)} · {e.code}
                  </li>
                ))}
              </ul>
            )}
          </Widget>

          <Widget title="Livraisons & à préparer">
            {data.livraisonsAVenir.length === 0 &&
            data.commandesAPreparer.length === 0 ? (
              <Empty>Pas de commande active</Empty>
            ) : (
              <ul className="space-y-2 text-sm">
                {data.commandesAPreparer.map((c) => (
                  <li key={`p-${c.id}`}>
                    À préparer #{c.id} — {c.client.nom}
                  </li>
                ))}
                {data.livraisonsAVenir.map((c) => (
                  <li key={`l-${c.id}`}>
                    Livraison #{c.id} — {c.client.nom} ·{' '}
                    {c.dateLivraison.toISOString().slice(0, 10)} ({c.statut})
                  </li>
                ))}
              </ul>
            )}
          </Widget>
        </div>
      )}
    </div>
  );
}

function Widget({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card">
      <h2 className="mb-3 font-display text-lg text-primary">{title}</h2>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-ink/50">{children}</p>;
}
