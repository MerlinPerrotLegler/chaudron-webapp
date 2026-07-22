# AI.md — Prompt de contribution (Claude, Cursor & autres agents)

> Fichier maître pour tout assistant IA travaillant sur ce dépôt. `CLAUDE.md`, `AGENTS.md` et les règles Cursor (`.cursor/rules`) dériveront de ce fichier — le contenu de fond vit **ici**.

---

## 1. Le projet en une phrase

**chaudron-webapp** est l'application web de gestion de la ferme de transformation PPAM **« Le Chaudron qui sent bon »** (La Cavalerie de Combret, Aveyron) : elle relie le commercial, la production/transformation, le stock et la culture, en remplacement d'un classeur Excel.

## 2. Avant d'écrire une seule ligne de code

**Lis la documentation de cadrage** (dossier `obsidian/`), dans cet ordre :

1. `obsidian/00 - Cas d'utilisation.md` — tous les cas d'usage (domaines A→G).
2. `obsidian/10 - Décisions & questions ouvertes.md` — décisions actées **D1–D18** (à respecter) + questions ouvertes.
3. `obsidian/A - Catalogue (spec).md` — spec détaillée du domaine en cours (Catalogue).
4. `obsidian/A - Catalogue — Plan 1 (Fondations & Matières).md` — le **plan d'implémentation** à exécuter tâche par tâche.
5. `obsidian/Guide technique pour développeurs.md` — contraintes d'hébergement Hostinger.

**Ne prends aucune décision d'architecture qui contredit ces documents.** Si une question ouverte bloque, demande — ne devine pas.

## 3. Stack & contraintes (non négociables)

- **Next.js 14** (App Router) + **TypeScript**, **Node 20**.
- **MySQL/MariaDB** via **Prisma** (ORM + migrations). Pas de SQLite.
- Validation par **Zod**, tests par **Vitest** (contre une base MySQL de test).
- Hébergement **Hostinger Business** : l'app écoute sur `process.env.PORT` ; uploads sur disque local persistant ; secrets via variables d'env (**jamais commités**, `.env`* gitignoré).
- API **REST**, réponses JSON, **erreurs normalisées** `{ code, message, details? }`, incohérence d'intégrité → **HTTP 409**.
- Auth : **clé d'API** (intégrations) + **login/mot de passe** (utilisateurs, multi-utilisateur).



## 4. Architecture

- **API-first** : le cœur métier est exposé par l'API ; le back-office et le storefront la consomment.
- **Couche services** : toute la logique métier vit dans `src/services/*` (fonctions testables sans HTTP). Les Route Handlers (`src/app/api/`**) sont des enveloppes minces (auth + validation + délégation).
- **Webhooks** : chaque action clé émet un événement (config JSON `nom.du.hook → [urls]`) — pour brancher un module comptable plus tard. Contrats **versionnés et documentés**.
- **Intégrité garantie par l'app** : noms uniques, références valides, **archivage** au lieu de suppression, renommage propagé par `id`.



## 5. Vocabulaire du domaine (à employer partout, tel quel)


| Terme                        | Sens                                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------- |
| **Produit fini**             | Ce que la ferme vend (recette × conditionnement, ou matière brute revendue)                 |
| **Matière fermière** 🟢      | Cultivée sur la ferme                                                                       |
| **Matière d'importation** 🟠 | Agricole, cultivée hors ferme, achetée (poivre, cannelle…)                                  |
| **Consommable de base** ⚪    | Non cultivable, acheté (sel, sucre, vinaigre, alcool…)                                      |
| **Matière**                  | Générique des trois ci-dessus, avec un champ `provenance` (`fermiere`/`importation`/`base`) |


Chaîne de traçabilité **obligatoire** : **Parcelle → Récolte → Transformation → Produit** (remontable de bout en bout).

## 6. Décisions structurantes (résumé — détail dans le doc Décisions)

- Modèle temporel : **année civile / 52 semaines**.
- **Transformation primaire** (séchage, distillation…) = opération tracée distincte de la production par recette.
- **Multi-utilisateur** ; opérateur tracé sur les actions.
- **Parcelle** = unité de base (pas d'entité « espace »), code `[A-Z]+-[0-9]{2,3}`.
- Storefront V1 = **front de vente interne** (pas de boutique publique).



## 7. Workflow de contribution

1. **TDD strict** : écrire le test qui échoue → le voir échouer → implémenter le minimum → test vert → **commit**. Suivre le découpage du plan (étapes de 2–5 min).
2. **DRY, YAGNI** : ne code que ce que le plan/spec demande. Pas de sur-ingénierie.
3. **Fichiers focalisés** : une responsabilité par fichier ; préférer plusieurs petits fichiers.
4. **Commits fréquents et atomiques**, messages en français, style `feat: …` / `fix: …` / `chore: …`.
5. **Ne jamais commiter de secret** ni de `.env`.
6. Respecter les **conventions API** (format d'erreur, pagination, 409) et le **vocabulaire** (§5).



## 8. Commandes (dès que le code existe)

```bash
npm install
npm run dev            # serveur de dev
npm test               # Vitest
npm run db:test:reset  # réinitialise la base MySQL de test
npm run build          # prisma generate + next build (prod)
```



## 9. Ce qui n'est PAS dans ce dépôt

- Le vault Obsidian personnel de l'exploitant (autre dépôt). Ici, `obsidian/` ne contient **que** la doc du projet WebApp.
- Le module comptable (externe, branché plus tard via webhooks).

---

*Ordre de lecture rapide pour un agent : ce fichier →* `obsidian/A - Catalogue — Plan 1 (…)` *→ exécuter tâche par tâche.*