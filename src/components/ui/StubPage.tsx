export function StubPage({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="space-y-2">
      <h1 className="font-display text-3xl text-primary">{title}</h1>
      <p className="text-ink/70">{hint}</p>
      <p className="text-sm text-ink/50">Écran à venir — l’API est déjà disponible.</p>
    </div>
  );
}
