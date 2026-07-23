# PROGRESS — chaudron-webapp

> Suivi de la **spécification** et de l’**implémentation**.  
> Cocher les lignes au fur et à mesure. Les **% sont indicatifs** (ordre de grandeur d’effort V1), à recalculer quand un plan passe à « fait ».
>
> **Convention** : pas de PR obligatoires pour le doc. Commits atomiques en français dès le code.
>
> **Ordre d’implémentation** : socle technique minimal → **A → E → D → C → B → F** ; T/S en continu / en fin ; **login/session (G1) en dernier**. Branche de travail : **`main`** (commits atomiques).

**Dernière mise à jour** : 2026-07-24 (Culture E1–E4 API livrée)

---

## Avancement global (indicatif)

| Volet | Avancement | Commentaire |
|-------|------------|-------------|
| **Spécification** | **~98 %** | Specs A→G + T + S rédigées ; reste polish mineur / questions mineures |
| **Implémentation code** | **~38 %** | Catalogue + **Culture E1–E4** API (53 tests) |
| **Projet V1 (pondéré)** | **~50 %** | Formule : `0,20 × spec + 0,80 × impl` → `0,20×98 + 0,80×38 ≈ 50 %` |

> Mettre à jour la ligne **Implémentation** et le **total pondéré** à chaque fin de plan (G1, A1…).

---

## Planification d’implémentation (roadmap + poids)

Poids = part approximative de l’effort d’implémentation V1 (total **100 %**).  
`Fait` = avancement **dans** ce bloc (0–100 %).  
`Contribution` = `poids × fait` (points vers le total implémentation).

### Ordre recommandé (phases)

| Phase | Contenu | Poids | Fait | Contribution |
|-------|---------|------:|-----:|-------------:|
| **P0** | Specs & cadrage (déjà faits — hors poids code) | — | 98 % | — |
| **P1** | Socle app + auth + webhooks (**G1–G3**) + shell UI minimal | 10 % | ~45 % | ~4,5 |
| **P2** | Catalogue API (**A** plans 1–3) | 12 % | **100 %** | 12 |
| **P3** | Culture (**E1–E4**) | 16 % | **100 %** | 16 |
| **P4** | Stock (**D1–D4**) | 11 % | 0 % | 0 |
| **P5** | Production & traçabilité (**C1–C4**) | 12 % | 0 % | 0 |
| **P6** | Commercial (**B1–B4**) | 13 % | 0 % | 0 |
| **P7** | UI domaines (écrans A4, E5, D5, C5, B5) + storefront **G4** | 12 % | 0 % | 0 |
| **P8** | Planification (**F1–F5**) | 7 % | 0 % | 0 |
| **P9** | Transverses (**T1–T5**) + Réglages (**S1–S4**) + uploads/search **G5** | 7 % | 0 % | 0 |
| | **Total implémentation** | **100 %** | | **~38 %** |

### Détail par domaine (plans)

| Domaine | Plans | Poids | Fait | Notes |
|---------|-------|------:|-----:|-------|
| **G** Plateforme | G1 Auth · G2 API keys · G3 Webhooks · G4 Storefront · G5 Uploads/search | 12 % | ~20 % | Health + `x-api-key` + emit fichier JSON ; **pas** encore login/sessions/ApiKey table |
| **A** Catalogue | A1–A3 ✅ · A4 UI | 14 % | ~85 % | API complète ; reste UI A4 |
| **E** Culture | E1–E4 ✅ · E5 UI | 18 % | ~80 % | API complète ; reste UI |
| **D** Stock | D1 Lots/mvt · D2 Achats · D3 Récolte/ajust. · D4 Produits/FIFO · D5 UI | 12 % | 0 % | |
| **C** Production | C1 Transfo · C2 Prod · C3 Avancement · C4 Traçabilité · C5 UI | 13 % | 0 % | Dépend D+E |
| **B** Commercial | B1 Clients/PdV · B2 Intentions · B3 Commandes · B4 Livrer · B5 Ventes/UI | 14 % | 0 % | |
| **F** Planification | F1–F5 | 7 % | 0 % | En dernier |
| **T** Transverses | T1–T5 | 5 % | 0 % | Dashboard tôt possible (T1 partiel) |
| **S** Réglages | S1–S4 | 5 % | 0 % | Apparence tôt = gain UX |
| | | **100 %** | | |

### Jalons « utilisable »

| Jalon | Quand (indicatif) | % impl. cumulé approx. |
|-------|-------------------|------------------------:|
| **J1** App tourne + login + health | fin P1 | ~10 % |
| **J2** CRUD matières/recettes/produits (API) | fin P2 | ~22 % |
| **J3** Culture + récoltes (API) | fin P3 | ~38 % |
| **J4** Stock + achats + lien récolte | fin P4 | ~49 % |
| **J5** Prod / séchage / traçabilité | fin P5 | ~61 % |
| **J6** Ventes + commandes + clients | fin P6 | ~74 % |
| **J7** Back-office + storefront utilisables | fin P7 | ~86 % |
| **J8** Planif + stats + settings + import | fin P8–P9 | **~100 %** |

---

## Légende (spécification)

| Symbole | Sens |
|---------|------|
| `[x]` | Spec / plan rédigé ou item fait |
| `[ ]` | À faire |
| `~` | Partiellement couvert |

**Livrables types par domaine** :
1. **Spec** — modèle, règles, API, écrans, webhooks.
2. **Plan(s) d’implémentation** — découpage TDD ; puis code + tests.

---

## Cadrage global

- [x] Cas d’utilisation A→G + transverses (`obsidian/00 - Cas d'utilisation.md`)
- [x] Décisions D1–D18 + questions ouvertes (`obsidian/01 - Décisions & questions ouvertes.md`)
- [x] Guide technique Hostinger (`obsidian/02 - Guide technique pour développeurs.md`)
- [x] Prompt agents / stack (`AI.md`, `AGENTS.md`, `CLAUDE.md`, `.cursor/rules`)
- [ ] Trancher / figer les **questions ouvertes** restantes encore marquées `❓` (voir § Questions ouvertes)
- [ ] Glossaire unique figé (déjà dans UC + AI.md — vérifier cohérence croisée une dernière fois)

---

## A. Catalogue (socle)

> Spec métier : `obsidian/A - Catalogue (spec).md` · Plan 1 : `obsidian/A - Catalogue — Plan 1 (Fondations & Matières).md`

### Spec métier

- [x] Périmètre & décisions de conception (CA-1…CA-5)
- [x] Modèle de données (Matière, Prix, Recette, Ingrédients, Étapes, Équipements, Conditionnement, Produit fini, Paramètres)
- [x] Écrans back-office Catalogue
- [x] API REST Catalogue
- [x] Règles de calcul (coût matière, MO, revient, marge)
- [x] Invariants d’intégrité
- [x] Webhooks Catalogue
- [ ] Points encore ouverts dans la spec A : seuil stock mini matière · référentiel fournisseurs · import v19 (renvoyés ailleurs — confirmer & pointer)

### Plans d’implémentation Catalogue

- [x] Plan 1 — Fondations & API Matières — **code livré** (CRUD + prix + webhooks + tests)
- [x] Plan 2 — Recettes — **code livré** (CRUD, ingrédients, étapes, coût, dupliquer)
- [x] Plan 3 — Conditionnements + Produits finis — **code livré**
- [ ] Plan 4 — Écrans back-office Catalogue
- [ ] Plan 5 — Auth multi-utilisateur + doc API/webhooks → **absorbé par G1–G3** ([[G - Plateforme (spec)]])

---

## E. Culture

> Dépend de A (matière ↔ espèce). Demande forte (planning + cascade).
> Spec métier : `obsidian/E - Culture (spec).md`

### Spec métier

- [x] Spec `E - Culture (spec).md`
- [x] **Parcelle** (lettres) + **Planche** (numéros → code `SA-01`) ; vocation sur parcelle ; journals/images sur planche
- [x] Espèces & données culturales (lien matière fermière)
- [x] Itinéraires techniques (étapes personnalisables, durées en **jours**, fenêtres `MM-DD`)
- [x] Associations & risques (données V1 ; alertes auto plus tard — Q-E8)
- [x] Lots de culture (sur **planche**) & planning **au jour près**
- [x] Cascade avant / arrière + verrouillage / découplage (UC-E3.3–E3.5)
- [x] Détection de conflits (planche, surface, saison)
- [x] Récoltes multi-sessions / campagnes (pluie, reprise) + webhook
- [x] API Culture + webhooks (`recolte.declaree`, …)
- [x] Écrans (parcelles, planches, calendrier jour, lots)

### Plans

- [x] Plan E1 — Parcelles + Planches + journals — **code livré**
- [x] Plan E2 — Espèces + itinéraires + assoc/risques/faisabilité — **code livré**
- [x] Plan E3 — Lots + cascade + conflits + planning — **code livré**
- [x] Plan E4 — Récoltes multi-sessions + webhook (stub stock D) — **code livré**
- [ ] Plan E5 — Écrans back-office Culture

---

## D. Stock

> Dépend de A ; branché par C (prod/transf.), E (récoltes), B (ventes).
> Spec métier : `obsidian/D - Stock (spec).md`

### Spec métier

- [x] Spec `D - Stock (spec).md`
- [x] Stock produits finis (lots, alertes mini / vs intentions si B)
- [x] Stock matière (lots, toutes provenances ; frais/sec = matières distinctes)
- [x] Entrées : récoltes (service E) + achats + webhook
- [x] Sorties : services production / transformation / vente (FIFO DLUO)
- [x] DLUO / péremption par lot (Q-D1)
- [x] Emplacements select+créer (Q-D2), lien n° de sacs
- [x] API Stock + webhooks mouvements / achat
- [x] Écrans stock & alertes

### Plans

- [ ] Plan D1 — Emplacements + lots/mouvements + soldes lecture
- [ ] Plan D2 — Achats + entrée matière + webhook
- [ ] Plan D3 — Service récolte (E) + ajustements + transferts
- [ ] Plan D4 — Lots produit + services C/B + FIFO DLUO
- [ ] Plan D5 — Alertes + écrans back-office

---

## C. Production & transformation

> Dépend de A + D (+ E pour la chaîne de traçabilité).
> Spec métier : `obsidian/C - Production & transformation (spec).md`

### Spec métier

- [x] Spec `C - Production & transformation (spec).md`
- [x] Transformation primaire C0 (matière→matière, lots, rendement, webhook)
- [x] Production C1 (recette → produit fini, opérateur, lot, DLUO)
- [x] Traçabilité obligatoire **Parcelle → Planche → Récolte → Séchage → Transformation → Produit** (**poids + notes** à chaque étape)
- [x] Alerte / 409 matière insuffisante
- [x] Suivi d’avancement productions (étapes) + tableau de bord goulots
- [x] API + webhooks `transformation.declaree`, `production.declaree`
- [x] Écrans déclaration & suivi

### Plans

- [ ] Plan C1 — Transformations + stock + webhook
- [ ] Plan C2 — Productions (besoins, terminer, stock, webhook)
- [ ] Plan C3 — Avancement étapes + tableau de bord
- [ ] Plan C4 — API traçabilité
- [ ] Plan C5 — Écrans back-office

---

## B. Commercial

> Dépend de A (+ D pour déstockage). Storefront avec G.
> Spec métier : `obsidian/B - Commercial (spec).md`

### Spec métier

- [x] Spec `B - Commercial (spec).md`
- [x] **Fiches clients** + historique (commandes, ventes, notes)
- [x] Intentions de vente (année civile, priorité, CA/marge prévisionnels)
- [x] Dérivation besoins produits → besoins matière (+ carnet commandes)
- [x] **Commandes** (client + canal PdV + `date_livraison`) ; déstockage à livraison
- [x] Ventes réalisées (directes marché + via commande)
- [x] Comparaison réalisé vs intention
- [x] Historique des ventes filtrable
- [x] Points de vente = **canaux** + jours/dates livraison (D9)
- [x] API Commercial + webhooks `client.*` / `commande.*` / `vente.realisee`
- [x] Écrans (clients, commandes, calendrier, intentions, ventes)

### Plans

- [ ] Plan B1 — Clients (+ notes/historique) + Points de vente + dates livraison
- [ ] Plan B2 — Intentions + synthèse CA/marge
- [ ] Plan B3 — Commandes (CRUD, statuts, lien client)
- [ ] Plan B4 — Livrer → stock + ventes + historique client
- [ ] Plan B5 — Ventes directes + réalisé vs intention + besoins + calendrier / écrans

---

## F. Planification

> Arrive en dernier : agrège B, D, E.
> Spec métier : `obsidian/F - Planification (spec).md`

### Spec métier

- [x] Spec `F - Planification (spec).md`
- [x] Proposition planning (intentions → besoins → surfaces, stock, vivaces, priorités)
- [x] Affectation **planches** (faisabilité 🟢🟡🔴)
- [x] Contrainte eau (affichage/filtre V1 — Q-E9)
- [x] Proposition modifiable + recalcul
- [x] Comparaison planifié vs besoin
- [x] Rotations / pérennité V1 : vivaces en place + historique info (CF-8) ; scoring auto plus tard
- [x] API / écrans moteur de proposition

### Plans

- [ ] Plan F1 — Calcul besoins + surfaces
- [ ] Plan F2 — Affectation planches + faisabilité
- [ ] Plan F3 — Édition + recalcul + couverture
- [ ] Plan F4 — Appliquer → Lots Culture
- [ ] Plan F5 — Écrans + filtre eau + vivaces

---

## G. Plateforme (transverse)

> Posée dès A, enrichie à chaque domaine. Spec : `obsidian/G - Plateforme (spec).md`

### Spec métier

- [x] Spec `G - Plateforme (spec).md`
- [x] Conventions API REST communes (erreurs, pagination, versioning payloads)
- [x] Auth : clé d’API + login/mot de passe multi-utilisateur (D14) ; opérateur tracé
- [x] Catalogue des webhooks (registre, config JSON, doc, log ; retry auto = non V1)
- [x] Storefront = front de vente interne (D8)
- [x] Uploads / stockage fichiers (Hostinger)
- [x] Hors V1 explicite : compta, boutique publique, rôles fins

### Plans

- [ ] Plan G1 — Auth login/session + Utilisateurs
- [ ] Plan G2 — Clés API + middleware auth
- [ ] Plan G3 — Webhooks emit + config + log + rejeu manuel
- [ ] Plan G4 — Storefront UI vente rapide
- [ ] Plan G5 — Uploads + recherche globale

---

## Transverse (T)

> Spec : `obsidian/T - Transverses (spec).md`

- [x] Spec **Recherche globale** (UC-T1)
- [x] Spec **Tableau de bord d’accueil** (UC-T2)
- [x] Spec **Import initial** Excel v19 (UC-T3)
- [x] **Journal / audit** léger (UC-T4) — CT-4
- [x] Spec **Export CSV** (UC-T5)
- [x] **Sauvegarde** download admin ; restore hors UI (UC-T6) — CT-6
- [x] Intégrité référentielle (UC-T7) — rappel transverse
- [x] Spec **Statistiques** (UC-T8 / D12)

### Plans

- [ ] Plan T1 — Search + dashboard
- [ ] Plan T2 — Export CSV + AuditLog
- [ ] Plan T3 — Stats générale + ventes/marges
- [ ] Plan T4 — Stats production/stock/culture/charge
- [ ] Plan T5 — Import Excel + backup download

---

## Réglages & apparence (S)

> Spec : `obsidian/S - Réglages & apparence (spec).md`

- [x] Spec hub `/settings` (apparence, identité, métier, admin)
- [x] Thème CSS variables + logo + presets polices
- [x] Lien Parametres métier (A/D) sans double source
- [x] Defaults visuels (éviter clichés purple / cream-terracotta)

### Plans

- [ ] Plan S1 — AppSettings + API + injection CSS
- [ ] Plan S2 — Écran apparence + logo
- [ ] Plan S3 — Hub settings (identité, métier, liens admin)
- [ ] Plan S4 — Densité + branding storefront

---

## Questions ouvertes à trancher (spécification)

> Source : `obsidian/01 - Décisions & questions ouvertes.md`. Cocher quand la décision est actée (et idéalement promu en Dn ou notée dans la spec concernée).

### Encore floues / à confirmer

- [ ] Q-A — Référentiel **fournisseurs** dédié vs champ texte V1 *(texte acté V1 dans D)*
- [x] Q-C — Paramètres transformations V1 = JSON libre (CC-3 [[C - Production & transformation (spec)]])
- [x] Q-F — Rotations / pérennité V1 → CF-8 (vivaces + info historique ; scoring plus tard)
- [x] Q-G3 — **Retry auto webhooks** = non V1 ; log + rejeu manuel (CG-6)
- [x] Q-T4 — AuditLog léger (CT-4 [[T - Transverses (spec)]])
- [x] Q-T6 — Backup download ; restore hors UI (CT-6)
- [ ] Q-U — Rôles / permissions différenciés (reporté « plus tard » — confirmer hors V1)
- [x] Stock mini alerte matières / produits → CD-5 [[D - Stock (spec)]]
- [x] Contact sur points de vente → champ texte V1 (CB-7)
- [ ] Import en masse des ventes (UC-B2.4 `❓`) — hors V1

### Défauts V1 déjà proposés (à valider formellement si pas encore actés D*)

- [x] Q-U1 Multi-utilisateur → D14
- [x] Q-A1…Q-A7 défauts Catalogue (variantes, concurrence hors V1, historique prix, revente, unités, cosmétique, cat. réglementaire)
- [x] Q-B1…Q-B5 (intentions année, PdV, saisie agrégée, intentions sans PdV, taux horaire global)
- [x] Q-C1 Traçabilité obligatoire → D15 ; Q-C2 enregistrer + avancement
- [x] Q-D1 DLUO dans périmètre ; Q-D2 emplacements select+créer → D15
- [x] Q-G1…Q-G4 → D8 / D17
- [x] Q-E1…Q-E9 défauts Culture (itinéraires, parcelle, images, rendement, associations, eau)

---

## Prochaine étape suggérée

1. **Stock D1–D4** (lots, mouvements, achats, FIFO).
2. Puis Production C / Commercial B.
3. **G1 login** en dernier.

---

## Journal des mises à jour

| Date | Changement |
|------|------------|
| 2026-07-23 | Création de `PROGRESS.md` — inventaire initial de la spécification |
| 2026-07-23 | Spec `E - Culture (spec).md` rédigée ; checklist E coché ; plans E1–E5 listés |
| 2026-07-23 | Spec E ajustée : Parcelle seule entité ; **tout en jours** ; multi-récoltes actées ; D2 précisé |
| 2026-07-23 | Spec E / D6–D16 : **Parcelle (lettres) + Planche (numéros)** ; récoltes multi-sessions / `campagne_id` (pluie) |
| 2026-07-23 | Spec `D - Stock (spec).md` ; Q-D1/Q-D2 et `stock_mini` actés ; plans D1–D5 listés |
| 2026-07-23 | Spec `C - Production & transformation (spec).md` ; plans C1–C5 ; params transfo = JSON libre |
| 2026-07-23 | Traçabilité canonique : **… → Récolte → Séchage → Transformation → Produit** (D15 / AI / UC / C) |
| 2026-07-23 | CC-12 / CE-14 : **poids + notes** à chaque étape de la chaîne et chaque étape de procédé |
| 2026-07-23 | Spec `B - Commercial (spec).md` ; plans B1–B5 |
| 2026-07-23 | B enrichi : **commandes** + **dates de livraison** PdV (CB-10…14, D9) |
| 2026-07-23 | B : **fiches clients** + historique (CB-15…17) ; PdV = canal |
| 2026-07-23 | Spec `G - Plateforme (spec).md` ; plans G1–G5 ; Q-G3 acté (pas de retry auto) |
| 2026-07-23 | Spec `F - Planification (spec).md` ; plans F1–F5 ; UC-F1.5 tranché (CF-8) |
| 2026-07-23 | Specs `T - Transverses` + `S - Réglages & apparence` ; Q-T4/T6 tranchés |
| 2026-07-23 | Roadmap d’**implémentation** + % (phases P1–P9, jalons J1–J8, avancement global) |
| 2026-07-23 | **Plan Catalogue 1 code** : scaffold, Prisma, API Matières, webhooks ; ~8 % impl ; branche `feat/catalogue-plan-1` |
| 2026-07-23 | Merge Plan 1 → **`main`** ; login reporté en dernier ; Plan A2 rédigé ; `.env` distant à renseigner |
| 2026-07-23 | MySQL distant OK + migrate ; **Plan A2 code** (38 tests) ; ~12 % impl |
| 2026-07-24 | **Plan A3 code** (conditionnements, produits, revient, recette simple) ; 45 tests ; ~16 % impl |
| 2026-07-24 | `.env.test` distant OK (`%21`) ; **Culture E1** (parcelles/planches/journals) ; 50 tests ; ~22 % impl |
| 2026-07-24 | **Culture E2–E4** (espèces, lots/cascade, récoltes) ; 53 tests ; ~38 % impl / ~50 % V1 |
