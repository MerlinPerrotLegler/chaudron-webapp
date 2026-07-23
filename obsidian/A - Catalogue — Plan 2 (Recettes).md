# Catalogue — Plan 2 : Recettes (ingrédients, étapes, coût matière)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Livrer l’**API REST des Recettes** : CRUD, ingrédients, étapes (+ équipements), calcul **coût matière** (modes `proportions` / `absolu`) + badge `cout_partiel`, **temps de main-d’œuvre**, duplication, webhooks — testée en TDD.

**Architecture:** Même stack que le Plan 1. Logique dans `src/services/*` ; Route Handlers minces ; Zod ; Vitest + MySQL de test. Schéma Prisma **déjà en place** (Plan 1) — pas de nouvelle migration sauf besoin ponctuel.

**Tech Stack:** Next.js 14 · TypeScript · Prisma 5 · MySQL · Zod · Vitest · Node 20.

## Global Constraints

- Auth V1 pour l’API métier : header **`x-api-key`** (login/session **plus tard**, hors de ce plan).
- Erreurs `{ code, message, details? }` ; conflit d’intégrité → **409** ; validation métier → **422** ; Zod → **422**.
- Vocabulaire : Matière / provenance `fermiere`|`importation`|`base`.
- Pas d’UI back-office dans ce plan (Plan A4).
- Pas de prix de revient produit / conditionnements (Plan A3).
- Commits atomiques en français sur **`main`**.

---

## Structure des fichiers (Plan 2)

- `src/lib/units.ts` — conversions d’unités (g↔kg, mL↔L, piece via `poids_equiv_g`)
- `src/lib/validation/recette.ts` — schémas Zod recette / ingrédient / étape
- `src/services/recette.ts` — CRUD recette, archive, dupliquer
- `src/services/recetteIngredient.ts` — CRUD lignes
- `src/services/recetteEtape.ts` — CRUD étapes + liaison équipements
- `src/services/recetteCout.ts` — `computeCoutMatiere`, `computeTempsMo`
- `src/app/api/recettes/route.ts` — GET liste, POST
- `src/app/api/recettes/[id]/route.ts` — GET, PUT, DELETE(archive)
- `src/app/api/recettes/[id]/dupliquer/route.ts` — POST
- `src/app/api/recettes/[id]/ingredients/route.ts` + `[ingredientId]/route.ts`
- `src/app/api/recettes/[id]/etapes/route.ts` + `[etapeId]/route.ts`
- `src/app/api/recettes/[id]/cout/route.ts` — GET
- `src/app/api/equipements/route.ts` — GET/POST minimal (référentiel)
- Tests : `test/recette-*.test.ts`, `test/units.test.ts`, `test/recette-cout.test.ts`

---

### Task 1 : CRUD Recette (sans sous-ressources)

**Files:**
- Create: `src/lib/validation/recette.ts`, `src/services/recette.ts`, `src/app/api/recettes/route.ts`, `src/app/api/recettes/[id]/route.ts`
- Test: `test/recette-crud.test.ts`

**Interfaces:**
- `recetteCreateSchema` / `recetteUpdateSchema`
- `createRecette`, `listRecettes`, `getRecette`, `updateRecette`, `archiveRecette`
- Règles : `nom` unique → 409 ; archive si produits actifs → 409 (sinon OK) ; liste exclut `archivee` par défaut.
- Type `simple` : autorisé dès maintenant (mono-ingrédient imposé plus tard côté métier optionnel — YAGNI : pas de contrainte auto V1 hors doc).

- [ ] **Step 1 : Test qui échoue**

`test/recette-crud.test.ts` :
```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { resetDb } from './db';
import { createRecette, listRecettes, getRecette, updateRecette, archiveRecette } from '@/services/recette';

beforeEach(resetDb);

describe('CRUD recette', () => {
  it('crée une recette de transformation', async () => {
    const r = await createRecette({
      nom: 'Herbes de Provence',
      famille: 'sec',
      type: 'transformation',
      modeQuantite: 'proportions',
    });
    expect(r.id).toBeGreaterThan(0);
    expect(r.archivee).toBe(false);
  });

  it('refuse un nom en doublon (409)', async () => {
    await createRecette({ nom: 'Sel aromatisé', famille: 'sel', type: 'transformation' });
    await expect(
      createRecette({ nom: 'Sel aromatisé', famille: 'sel', type: 'transformation' }),
    ).rejects.toMatchObject({ code: 'conflict', status: 409 });
  });

  it('liste / lit / met à jour / archive', async () => {
    const r = await createRecette({ nom: 'Sirop thym', famille: 'sirop', type: 'transformation' });
    expect((await listRecettes({})).total).toBe(1);
    expect((await getRecette(r.id)).nom).toBe('Sirop thym');
    const u = await updateRecette(r.id, { description: 'Lot été' });
    expect(u.description).toBe('Lot été');
    expect((await archiveRecette(r.id)).archivee).toBe(true);
    expect((await listRecettes({})).total).toBe(0);
  });
});
```

- [ ] **Step 2 : `npm test test/recette-crud.test.ts` — FAIL**
- [ ] **Step 3 : Implémenter validation + service + routes** (miroir du pattern Matière : `requireApiKey`, `handle`, `paginated`).
- [ ] **Step 4 : Tests verts**
- [ ] **Step 5 : Commit** `feat: CRUD API recettes`

---

### Task 2 : Ingrédients d’une recette

**Files:**
- Create: `src/services/recetteIngredient.ts`, routes ingredients
- Modify: `src/lib/validation/recette.ts`
- Test: `test/recette-ingredients.test.ts`

**Interfaces:**
- `ingredientCreateSchema` : `{ matiereId, quantite, unite, ordre?, poidsEquivG? }`
- `addIngredient`, `updateIngredient`, `removeIngredient`, `listIngredients`
- Matière absente / archivée → 404/409 ; recette absente → 404.

- [ ] **Step 1 : Test**
```ts
// crée recette + 2 matières ; ajoute 2 lignes ; update quantité ; delete une ligne
// refuse matiereId inconnu → not_found
```
- [ ] **Step 2 : FAIL → implémenter → PASS → commit** `feat: ingrédients de recette (CRUD)`

---

### Task 3 : Étapes + équipements

**Files:**
- Create: `src/services/recetteEtape.ts`, `src/services/equipement.ts`, routes etapes + equipements
- Test: `test/recette-etapes.test.ts`

**Interfaces:**
- Étape : `{ description, ordre?, tempsMainOeuvre?, tempsAttente?, parametres?, equipementIds?: number[] }`
- `parametres` JSON libre (stocké dans colonne `parametres` Prisma).
- Créer équipement par nom si besoin (`findOrCreate` ou POST `/api/equipements`).
- CRUD étapes ; replace `equipementIds` à la mise à jour.

- [ ] **Step 1 : Test** create étape avec 1 équipement ; sum temps ; update ; delete
- [ ] **Step 2 : FAIL → impl → PASS → commit** `feat: étapes de recette + équipements`

---

### Task 4 : Conversions d’unités

**Files:**
- Create: `src/lib/units.ts`
- Test: `test/units.test.ts`

**Interfaces:**
```ts
export type UniteLigne = 'g' | 'kg' | 'mL' | 'L' | 'piece' | 'part' | string;

/** Convertit une quantité de ligne vers l’unité d’achat de la matière. null si impossible. */
export function toUniteAchat(
  quantite: number,
  uniteLigne: string,
  uniteAchat: 'kg' | 'L' | 'piece',
  poidsEquivG?: number | null,
): number | null;
```

Règles :
- `g`→`kg` : `/1000` ; `kg`→`kg` : identité ; `mL`→`L` : `/1000` ; `L`→`L` : identité.
- `piece`→`piece` : identité.
- `piece`/`part`/autre → `kg` uniquement via `poidsEquivG` (g) → kg = `poidsEquivG/1000 * quantite`.
- Incompatible (ex. `L` vers `kg` sans densités) → `null`.

- [ ] **Step 1 : Tests unitaires purs (table de cas)**
- [ ] **Step 2 : FAIL → impl → PASS → commit** `feat: conversions d'unités pour coût matière`

---

### Task 5 : Calcul coût matière + temps MO

**Files:**
- Create: `src/services/recetteCout.ts`, `src/app/api/recettes/[id]/cout/route.ts`
- Modify: éventuellement helper `currentPrix` déjà dans `matierePrix`
- Test: `test/recette-cout.test.ts`

**Interfaces:**
```ts
export type CoutMatiereResult = {
  coutMatiereKg: number | null;       // null si aucune ligne coûtable / sortie invalide
  coutPartiel: boolean;
  modeQuantite: 'proportions' | 'absolu';
  tempsMoMinutes: number;
};
export function computeCoutMatiere(/* … */): Promise<CoutMatiereResult>;
```

Règles (spec §6.1–6.2) :
- **proportions** : `fraction_i = q_i / Σ q` → `cout = Σ (fraction_i × prix_courant_i)` ; ligne sans prix → `cout_partiel`.
- **absolu** : `cout_lot = Σ (qty_en_unite_achat × prix)` ; `cout_matiere = cout_lot / quantite_sortie` ; si `quantite_sortie` absent/≤0 → `cout_partiel` + `coutMatiereKg = null`.
- Ligne non convertible → `cout_partiel`.
- `tempsMoMinutes = Σ etapes.tempsMainOeuvre` (attente exclue).

- [ ] **Step 1 : Tests** proportions 50/50 deux matières à 10 et 20 €/kg → coût 15 ; absolu ; partiel sans prix ; temps MO
- [ ] **Step 2 : FAIL → impl → route GET → PASS → commit** `feat: calcul coût matière et temps MO`

---

### Task 6 : Dupliquer + webhooks recette

**Files:**
- Modify: `src/services/recette.ts`, `webhooks.config.json`
- Create: `src/app/api/recettes/[id]/dupliquer/route.ts`
- Test: `test/recette-dupliquer.test.ts`, étendre spy webhook

**Interfaces:**
- `dupliquerRecette(id)` → clone nom `… (copie)`, mêmes ingrédients/étapes/équipements ; émet `recette.creee`.
- `createRecette` / `updateRecette` émettent `recette.creee` / `recette.maj` (payload minimal `id, nom, famille` ; coût optionnel si calcul rapide).

- [ ] **Step 1 : Tests**
- [ ] **Step 2 : FAIL → impl → PASS → commit** `feat: duplication recette + webhooks`

---

## Definition of Done (Plan 2)

- `npm test` vert (Plan 1 + Plan 2).
- API : `/api/recettes`, `/:id`, `/ingredients`, `/etapes`, `/cout`, `/dupliquer` + `/api/equipements`.
- Coût matière proportions/absolu + `cout_partiel` + temps MO conformes à la spec.
- Auth toujours par `x-api-key` uniquement.

## Plans suivants

- **Plan 3** — Conditionnements + Produits finis (revient, marge, recette simple).
- **Plan 4** — UI Catalogue.
- **Auth login/session** — en dernier (G1), après le métier prioritaire.

## Liens

- [[A - Catalogue (spec)]] · [[A - Catalogue — Plan 1 (Fondations & Matières)]] · [[G - Plateforme (spec)]]
