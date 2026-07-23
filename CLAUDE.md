# CLAUDE.md

Instructions pour **Claude Code** sur ce dépôt.

## Source de vérité

Le contenu de fond (projet, stack, architecture, vocabulaire, workflow) vit dans **[AI.md](AI.md)**. **Lis-le en premier** et respecte-le. Ce fichier n'en est qu'un rappel.

## Avant d'écrire du code

1. Lire `AI.md`.
2. Lire, dans `obsidian/`, la **spec** puis le **plan** du domaine en cours (`A - Catalogue (spec).md`, `A - Catalogue — Plan 1 (…)`).
3. Ne rien décider qui contredise les **décisions D1–D18** (`obsidian/01 - Décisions & questions ouvertes.md`). En cas de blocage : demander, ne pas deviner.

## Règles de travail

- **TDD strict** : test qui échoue → implémentation minimale → test vert → commit. Suivre le découpage du plan.
- **DRY, YAGNI**, fichiers focalisés (une responsabilité).
- Logique métier dans `src/services/*` (testable sans HTTP) ; Route Handlers minces.
- **Commits atomiques en français** : `feat:` / `fix:` / `chore:`.
- **Jamais de secret commité** (`.env*` gitignoré).
- **Vocabulaire imposé** : Produit fini / Matière fermière / Matière d'importation / Consommable de base.
- API REST : erreurs `{ code, message, details? }`, incohérence d'intégrité → **409**.

## Stack

Next.js 14 (App Router) · TypeScript · Prisma + MySQL · Zod · Vitest · Node 20.

## Commandes

```bash
npm test               # Vitest
npm run dev            # serveur de dev
npm run db:test:reset  # réinitialise la base MySQL de test
npm run build          # prisma generate + next build
```
