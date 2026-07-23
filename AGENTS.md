# AGENTS.md

Instructions pour les agents de code (Cursor, Codex, et autres outils lisant `AGENTS.md`).

## Référence

La documentation complète de contribution est **[AI.md](AI.md)**. Lis-le avant toute modification ; il fait autorité.

## L'essentiel

- **Stack** : Next.js 14 (App Router) · TypeScript · Prisma + MySQL · Zod · Vitest · Node 20.
- **Architecture** : API-first REST ; logique métier isolée dans `src/services/*` (testable sans HTTP) ; Route Handlers minces ; webhooks configurables ; intégrité garantie par l'app (noms uniques, archivage, 409).
- **Workflow** : **TDD strict**, commits atomiques en français (`feat:`/`fix:`/`chore:`), DRY/YAGNI, jamais de secret commité.
- **Contexte projet** : dans `obsidian/` — cas d'usage, décisions **D1–D18**, spec et plan du domaine en cours. Ne pas contredire ces documents.
- **Vocabulaire imposé** : Produit fini / Matière fermière / Matière d'importation / Consommable de base (champ `provenance`).

Ordre de lecture : `AI.md` → `obsidian/A - Catalogue (spec).md` → `obsidian/A - Catalogue — Plan 1 (…)` → exécuter tâche par tâche.
