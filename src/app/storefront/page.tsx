'use client';

import { useEffect, useState } from 'react';
import { getApiKey, setApiKey } from '@/lib/api-client';
import { VenteForm } from '@/components/storefront/VenteForm';

export default function StorefrontPage() {
  const [mounted, setMounted] = useState(false);
  const [key, setKey] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const k = getApiKey();
    setKey(k);
    setReady(Boolean(k));
    setMounted(true);
  }, []);

  if (!mounted) {
    return <p className="text-ink/60">Chargement…</p>;
  }

  if (!ready) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-3xl text-primary">Clé API</h1>
        <p className="text-ink/70">
          Entrez la clé (`x-api-key`) pour enregistrer des ventes. Elle reste dans ce
          navigateur.
        </p>
        <input
          className="field min-h-12 font-mono"
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="API_KEY"
        />
        <button
          type="button"
          className="btn-primary min-h-12 w-full"
          onClick={() => {
            setApiKey(key.trim());
            setReady(true);
          }}
        >
          Continuer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-primary">Nouvelle vente</h1>
      <VenteForm />
    </div>
  );
}
