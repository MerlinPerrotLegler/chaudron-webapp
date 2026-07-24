import { getSettingsBundle } from '@/services/settings';

export default async function SettingsPage() {
  let bundle: Awaited<ReturnType<typeof getSettingsBundle>> | null = null;
  try {
    bundle = await getSettingsBundle();
  } catch {
    /* empty */
  }

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl text-primary">Réglages</h1>
      <p className="text-ink/70">
        Identité et apparence (lecture). L’édition complète arrivera avec l’écran Settings.
      </p>
      {bundle && (
        <div className="card space-y-2 text-sm">
          <p>
            <span className="text-ink/50">Nom</span> — {bundle.apparence.appName}
          </p>
          <p>
            <span className="text-ink/50">Fuseau</span> — {bundle.apparence.timezone}
          </p>
          <p>
            <span className="text-ink/50">Primary</span> —{' '}
            <span
              className="inline-block h-3 w-3 rounded-sm align-middle"
              style={{ background: bundle.apparence.colorPrimary }}
            />{' '}
            {bundle.apparence.colorPrimary}
          </p>
          <p>
            <span className="text-ink/50">Taux MO</span> —{' '}
            {bundle.metier.tauxHoraireMainOeuvre} €/h
          </p>
        </div>
      )}
    </div>
  );
}
