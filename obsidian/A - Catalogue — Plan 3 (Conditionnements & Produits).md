# Catalogue — Plan 3 : Conditionnements, Produits finis, revient & marge

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Livrer l’API **Conditionnements**, **Produits finis**, **Paramètres**, calcul **prix de revient** + **marge**, et helper **recette simple** (revente brute) — TDD.

**Architecture:** Services + Route Handlers (pattern A1/A2). Schéma Prisma déjà en place. Auth : `x-api-key` uniquement.

**Tech Stack:** Next.js 14 · Prisma 5 · MySQL · Zod · Vitest · Node 20.

## Global Constraints

- Commits atomiques en français sur **`main`**.
- Erreurs normalisées ; intégrité → **409**.
- Login/session **hors périmètre** (plus tard).
- `cout_total` conditionnement = saisi **ou** somme des 3 postes si non fourni.

---

## Structure des fichiers

- `src/lib/validation/conditionnement.ts`, `produit.ts`, `parametres.ts`
- `src/services/conditionnement.ts`, `produit.ts`, `parametres.ts`, `produitRevient.ts`
- `src/app/api/conditionnements/…`, `produits/…`, `parametres/route.ts`
- `src/app/api/matieres/[id]/recette-simple/route.ts` (raccourci)
- Tests : `test/conditionnement-*.test.ts`, `test/produit-*.test.ts`, `test/parametres.test.ts`, `test/produit-revient.test.ts`

---

### Task 1 : CRUD Conditionnements

- `create` / `list` / `get` / `update` / `archive`
- Si `coutTotal` absent à la création/maj : `coutTotal = coutContenant + coutBouchon + coutEtiquette`
- Archive refusée si produits actifs → 409
- Routes `/api/conditionnements`

- [ ] Test → FAIL → impl → PASS → commit `feat: CRUD API conditionnements`

### Task 2 : Paramètres (singleton id=1)

- `getParametres()` upsert défauts (`tauxHoraireMainOeuvre: 0`, `inclureMo: true`)
- `updateParametres(input)`
- Route `GET/PUT /api/parametres`

- [ ] Test → FAIL → impl → PASS → commit `feat: paramètres catalogue (taux horaire, inclure MO)`

### Task 3 : CRUD Produits finis

- Create : `{ recetteId, conditionnementId, poidsUnite, prixVenteUnite? }`
- Recette/conditionnement absents ou archivés → 404/409
- List filtre `actif` ; `update` (dont `actif`) ; pas de delete dure (désactiver via `actif: false`)
- Routes `/api/produits`

- [ ] Test → FAIL → impl → PASS → commit `feat: CRUD API produits finis`

### Task 4 : Prix de revient + marge

`computeRevient(produitId)` selon spec §6.3–6.4 :

```
nb_unites_lot = quantite_sortie / poids_unite   (poids_unite en kg ; quantite_sortie même unité → V1 : poids_unite en kg et unite_sortie 'kg' ; si unite_sortie 'L' et poids en kg → traiter comme masse V1 simplifiée : exiger unite_sortie ∈ {kg,L} et poidsUnite dans la même grandeur, sinon cout_partiel)
temps_mo_unite = temps_mo_recette / nb_unites_lot
cout_matiere_unite = cout_matiere_kg * poids_unite / rendement_ratio_travail
cout_conditionnement = conditionnement.cout_total
cout_mo_unite = (temps_mo_unite/60) * taux_horaire   si inclure_mo  (temps en minutes → heures)
prix_revient_unite = somme
marge_unite / marge_pct / marge_kg
```

Note : taux horaire = €/heure → convertir minutes : `tempsMoMinutes/60 * taux`.

Si `quantite_sortie` absente ou `cout_matiere_kg` null → flags `partiel` + champs null où pertinent.

Route `GET /api/produits/:id/revient`

- [ ] Tests numériques → FAIL → impl → PASS → commit `feat: prix de revient et marge produit`

### Task 5 : Recette simple + webhooks

- `creerRecetteSimple(matiereId, opts?)` : recette `type=simple`, mono-ingrédient 1 kg (ou 1 uniteAchat), mode absolu, quantiteSortie=1
- Route `POST /api/matieres/:id/recette-simple`
- Webhooks `conditionnement.maj`, `produit.cree`, `produit.maj`, `produit.desactive`

- [ ] Test → FAIL → impl → PASS → commit `feat: recette simple + webhooks produits/conditionnements`

---

## Definition of Done

- `npm test` vert (A1+A2+A3)
- API conditionnements, produits, parametres, revient, recette-simple
- Calcul revient conforme §6.3–6.4

## Suite

- Plan A4 UI (plus tard) · domaines E/D… · **login en dernier**
