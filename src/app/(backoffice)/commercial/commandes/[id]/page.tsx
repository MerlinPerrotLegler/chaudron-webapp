import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CommercialNav } from '@/components/commercial/CommercialNav';
import { CommandeActions } from '@/components/commercial/CommandeActions';
import { getCommande } from '@/services/commande';

export const dynamic = 'force-dynamic';

export default async function CommandeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  let cmd;
  try {
    cmd = await getCommande(id);
  } catch {
    notFound();
  }
  const total = cmd.lignes.reduce((s, l) => s + l.montant, 0);

  return (
    <div>
      <CommercialNav current="/commercial/commandes" />
      <Link href="/commercial/commandes" className="text-sm text-primary">
        ← Commandes
      </Link>
      <h1 className="mt-2 font-display text-3xl text-primary">Commande #{cmd.id}</h1>
      <p className="text-ink/70">
        {cmd.client.nom} · {cmd.pointVente.nom} · livraison{' '}
        {cmd.dateLivraison.toISOString().slice(0, 10)} ·{' '}
        <span className="font-medium text-primary">{cmd.statut}</span>
      </p>

      <div className="card mt-6">
        <h2 className="mb-3 font-display text-lg text-primary">Lignes</h2>
        <ul className="space-y-2 text-sm">
          {cmd.lignes.map((l) => (
            <li key={l.id} className="flex justify-between border-b border-ink/5 py-1">
              <span>
                {l.produitFini.recette.nom} × {l.quantite}
              </span>
              <span>
                {l.prixUnitaire.toFixed(2)} € → {l.montant.toFixed(2)} €
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-right font-medium">Total {total.toFixed(2)} €</p>
      </div>

      <div className="card mt-4">
        <h2 className="mb-3 font-display text-lg text-primary">Actions</h2>
        <CommandeActions id={cmd.id} statut={cmd.statut} />
      </div>
    </div>
  );
}
