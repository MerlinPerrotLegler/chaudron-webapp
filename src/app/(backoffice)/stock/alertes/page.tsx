import { StockNav } from '@/components/stock/StockNav';
import { listAlertesStock } from '@/services/stock';

export const dynamic = 'force-dynamic';

export default async function AlertesPage() {
  const alertes = await listAlertesStock();

  return (
    <div>
      <StockNav current="/stock/alertes" />
      <h1 className="font-display text-3xl text-primary">Alertes stock</h1>
      <p className="mb-6 text-sm text-ink/60">{alertes.length} alerte(s)</p>

      {alertes.length === 0 ? (
        <div className="card text-ink/50">Aucune alerte — stock mini et DLUO OK.</div>
      ) : (
        <ul className="space-y-2">
          {alertes.map((a, i) => (
            <li key={i} className="card border-accent/30">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
                {a.code}
              </p>
              <p className="mt-1">{a.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
