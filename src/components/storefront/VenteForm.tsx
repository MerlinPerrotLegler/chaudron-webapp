'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ApiClientError, apiFetch } from '@/lib/api-client';

type Produit = {
  id: number;
  prixVenteUnite: number | null;
  recette: { nom: string };
  conditionnement: { nom: string };
};

type PointVente = { id: number; nom: string };
type Client = { id: number; nom: string };

export function VenteForm() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [pdvs, setPdvs] = useState<PointVente[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [produitFiniId, setProduitFiniId] = useState('');
  const [pointVenteId, setPointVenteId] = useState('');
  const [clientId, setClientId] = useState('');
  const [quantite, setQuantite] = useState('1');
  const [prixUnitaire, setPrixUnitaire] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [p, pv, c] = await Promise.all([
          apiFetch<{ items: Produit[] }>('/api/produits?actif=true&pageSize=100'),
          apiFetch<PointVente[]>('/api/points-vente'),
          apiFetch<{ items: Client[] }>('/api/clients?pageSize=100'),
        ]);
        if (cancelled) return;
        setProduits(p.items);
        setPdvs(pv);
        setClients(c.items);
        if (p.items[0]) {
          setProduitFiniId(String(p.items[0].id));
          setPrixUnitaire(
            p.items[0].prixVenteUnite != null
              ? String(p.items[0].prixVenteUnite)
              : '',
          );
        }
        if (pv[0]) setPointVenteId(String(pv[0].id));
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof ApiClientError
              ? `${e.message} — définissez la clé API (bouton Clé API ou storefront).`
              : 'Chargement impossible',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = useMemo(
    () => produits.find((p) => String(p.id) === produitFiniId),
    [produits, produitFiniId],
  );

  useEffect(() => {
    if (selected?.prixVenteUnite != null) {
      setPrixUnitaire(String(selected.prixVenteUnite));
    }
  }, [selected]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setSubmitting(true);
    try {
      const body = {
        date: new Date().toISOString().slice(0, 10),
        produitFiniId: Number(produitFiniId),
        pointVenteId: Number(pointVenteId),
        quantite: Number(quantite),
        prixUnitaire: prixUnitaire === '' ? undefined : Number(prixUnitaire),
        clientId: clientId ? Number(clientId) : undefined,
      };
      const vente = await apiFetch<{ id: number; montant: number }>('/api/ventes', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      setMessage(`Vente #${vente.id} enregistrée — ${vente.montant.toFixed(2)} €`);
      setQuantite('1');
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(
          err.code === 'STOCK_INSUFFISANT'
            ? `Stock insuffisant : ${err.message}`
            : err.message,
        );
      } else {
        setError('Échec de la vente');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="text-lg text-ink/60">Chargement…</p>;
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto flex w-full max-w-lg flex-col gap-5">
      {error && (
        <div className="rounded-theme border border-red-200 bg-red-50 px-4 py-3 text-red-800">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-theme border border-primary/30 bg-primary/10 px-4 py-3 text-primary">
          {message}
        </div>
      )}

      <div>
        <label className="label" htmlFor="produit">
          Produit fini
        </label>
        <select
          id="produit"
          className="field min-h-12 text-lg"
          value={produitFiniId}
          onChange={(e) => setProduitFiniId(e.target.value)}
          required
        >
          {produits.map((p) => (
            <option key={p.id} value={p.id}>
              {p.recette.nom} — {p.conditionnement.nom}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="qty">
          Quantité
        </label>
        <input
          id="qty"
          className="field min-h-12 text-lg"
          type="number"
          min="0.01"
          step="any"
          value={quantite}
          onChange={(e) => setQuantite(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="label" htmlFor="prix">
          Prix unitaire (€)
        </label>
        <input
          id="prix"
          className="field min-h-12 text-lg"
          type="number"
          min="0"
          step="0.01"
          value={prixUnitaire}
          onChange={(e) => setPrixUnitaire(e.target.value)}
        />
      </div>

      <div>
        <label className="label" htmlFor="pdv">
          Point de vente
        </label>
        <select
          id="pdv"
          className="field min-h-12 text-lg"
          value={pointVenteId}
          onChange={(e) => setPointVenteId(e.target.value)}
          required
        >
          {pdvs.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nom}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="client">
          Client (optionnel)
        </label>
        <select
          id="client"
          className="field min-h-12 text-lg"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
        >
          <option value="">— Anonyme / marché —</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="btn-primary min-h-14 text-lg"
        disabled={submitting || !produits.length || !pdvs.length}
      >
        {submitting ? 'Enregistrement…' : 'Valider la vente'}
      </button>
    </form>
  );
}
