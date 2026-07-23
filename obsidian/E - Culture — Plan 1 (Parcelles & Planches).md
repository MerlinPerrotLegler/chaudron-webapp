# Culture — Plan E1 : Parcelles, Planches & journals

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans.

**Goal:** Modèle terrain **Parcelle** (lettres) + **Planche** (numéros → `SA-01`), journals (travaux, entrants, notes jour), historique, métadonnées images — API REST + TDD.

**Architecture:** Services + Route Handlers ; Prisma migration `culture_e1_terrain` ; auth `x-api-key`.

**Tech Stack:** Next.js 14 · Prisma 5 · MySQL · Zod · Vitest.

## Global Constraints

- Codes : parcelle `^[A-Z]+$` ; planche numéro `^[0-9]{2,3}$` ; `planche.code = {parcelle.code}-{numero}`.
- Archivage ; 409 si références actives.
- Renommage code parcelle → recalcul codes planches enfants (transaction).
- Images : V1 enregistre métadonnées + chemin ; upload fichier binaire = G5 (chemin libre ou stub).
- Commits sur **`main`**. Login plus tard.

---

### Task 1 : Schéma Prisma + migration

Modèles : `Parcelle`, `Planche`, `TravailSol`, `Entrant`, `PlancheImage`, `PlancheJour` + enums `VocationParcelle`, `TypeEntrant`.

- [ ] Écrire schéma → `prisma migrate dev --name culture_e1_terrain` (sur `.env.test`) → smoke test → commit

### Task 2 : CRUD Parcelles

- Validation code uppercase letters ; vocation enum
- Archive 409 si planches non archivées
- Update code → recalcule `planche.code` enfants
- Routes `/api/parcelles`
- Webhooks `parcelle.creee` / `parcelle.maj`

### Task 3 : CRUD Planches

- Create sous parcelle ou via body `parcelleId` + `numero` → dérive `code`
- Unique `(parcelleId, numero)` et `code` global
- Archive 409 si lots actifs (table LotCulture absente → skip / count 0)
- Routes `/api/planches` + `/api/parcelles/:id/planches`
- Webhooks `planche.creee` / `planche.maj`

### Task 4 : Journals

- Travaux sol, entrants (POST/GET)
- `PUT /planches/:id/jours/:date` notes
- `GET /planches/:id/historique?from=&to=`

### Task 5 : Images (métadonnées)

- POST JSON `{ cheminFichier, legende?, ordre? }` (multipart plus tard)
- GET liste ; DELETE archive/suppression méta

---

## DoD

`npm test` vert ; API terrain utilisable ; migration appliquée sur bases distant + test.
