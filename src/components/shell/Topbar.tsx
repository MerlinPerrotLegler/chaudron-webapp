'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, getApiKey, setApiKey } from '@/lib/api-client';

type SearchResult = {
  matieres: { id: number; nom: string }[];
  recettes: { id: number; nom: string }[];
  clients: { id: number; nom: string }[];
  planches: { id: number; code: string }[];
};

export function Topbar() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [keyDraft, setKeyDraft] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSearch(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    if (q.trim().length < 2) {
      setResults(null);
      return;
    }
    try {
      const data = await apiFetch<SearchResult>(`/api/search?q=${encodeURIComponent(q.trim())}`);
      setResults(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Recherche impossible');
      setResults(null);
    }
  }

  function saveKey() {
    setApiKey(keyDraft.trim());
    setShowKey(false);
  }

  return (
    <header className="relative z-20 border-b border-ink/10 bg-white/80 backdrop-blur">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        <form onSubmit={onSearch} className="flex min-w-[12rem] flex-1 gap-2">
          <input
            className="field max-w-md"
            placeholder="Rechercher…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Recherche"
          />
          <button type="submit" className="btn-ghost">
            Chercher
          </button>
        </form>
        <Link href="/storefront" className="btn-primary">
          Storefront
        </Link>
        <button
          type="button"
          className="btn-ghost text-xs"
          onClick={() => {
            setKeyDraft(getApiKey());
            setShowKey((v) => !v);
          }}
        >
          Clé API
        </button>
      </div>

      {showKey && (
        <div className="border-t border-ink/10 bg-canvas px-4 py-3">
          <p className="label">Clé API (x-api-key) — temporaire avant login</p>
          <div className="flex max-w-lg gap-2">
            <input
              className="field font-mono text-sm"
              type="password"
              value={keyDraft}
              onChange={(e) => setKeyDraft(e.target.value)}
            />
            <button type="button" className="btn-primary" onClick={saveKey}>
              Enregistrer
            </button>
          </div>
        </div>
      )}

      {err && <p className="px-4 pb-2 text-sm text-red-700">{err}</p>}

      {results && (
        <div className="absolute left-4 right-4 top-full max-h-80 overflow-auto rounded-theme border border-ink/10 bg-white p-3 shadow-lg">
          <button
            type="button"
            className="mb-2 text-xs text-ink/60"
            onClick={() => setResults(null)}
          >
            Fermer
          </button>
          <ResultGroup
            title="Matières"
            items={results.matieres.map((m) => ({
              label: m.nom,
              href: '/catalogue',
            }))}
            onPick={() => {
              setResults(null);
              router.push('/catalogue');
            }}
          />
          <ResultGroup
            title="Recettes"
            items={results.recettes.map((r) => ({
              label: r.nom,
              href: '/catalogue',
            }))}
            onPick={() => {
              setResults(null);
              router.push('/catalogue');
            }}
          />
          <ResultGroup
            title="Clients"
            items={results.clients.map((c) => ({
              label: c.nom,
              href: '/commercial',
            }))}
            onPick={() => {
              setResults(null);
              router.push('/commercial');
            }}
          />
          <ResultGroup
            title="Planches"
            items={results.planches.map((p) => ({
              label: p.code,
              href: '/culture',
            }))}
            onPick={() => {
              setResults(null);
              router.push('/culture');
            }}
          />
        </div>
      )}
    </header>
  );
}

function ResultGroup({
  title,
  items,
  onPick,
}: {
  title: string;
  items: { label: string; href: string }[];
  onPick: () => void;
}) {
  if (!items.length) return null;
  return (
    <div className="mb-3">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink/50">
        {title}
      </p>
      <ul className="space-y-1">
        {items.map((it) => (
          <li key={it.label}>
            <button
              type="button"
              className="w-full rounded-theme px-2 py-1 text-left text-sm hover:bg-primary/5"
              onClick={onPick}
            >
              {it.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
