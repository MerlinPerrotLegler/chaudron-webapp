# PROGRESS — Spécification chaudron-webapp

> Suivi de la **spécification** (pas de l’implémentation). Cocher une ligne quand le livrable correspondant existe et est suffisamment détaillé pour servir de base à un plan d’implémentation.
>
> **Convention** : pas de PR pour ce travail documentaire. Mettre à jour ce fichier à chaque avancée.
>
> **Ordre de construction** (cf. `obsidian/00 - Cas d'utilisation.md` §4) : A → E → D → C → B → F ; G transverse dès A.

**Dernière mise à jour** : 2026-07-23 (transverses T + settings S)

---

## Légende

| Symbole | Sens |
|---------|------|
| `[x]` | Spec rédigée (brouillon acceptable si cohérent avec D1–D18) |
| `[ ]` | À faire |
| `~` | Partiellement couvert (noter ce qui manque) |

**Livrables types par domaine** :
1. **Spec** (`obsidian/<Lettre> - <Domaine> (spec).md`) — modèle de données, règles, API, écrans, webhooks, hors périmètre.
2. **Plan(s) d’implémentation** — découpage TDD tâche par tâche (optionnel tant que la spec n’est pas stable ; requis avant code).

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

- [x] Plan 1 — Fondations & API Matières
- [ ] Plan 2 — Recettes (ingrédients, étapes, coût matière, temps)
- [ ] Plan 3 — Conditionnements + Produits finis (revient, marge, recette simple)
- [ ] Plan 4 — Écrans back-office Catalogue
- [ ] Plan 5 — Auth multi-utilisateur + doc API/webhooks → **absorbé par G1–G3** ([[G - Plateforme (spec)]])

---

## E. Culture

> Dépend de A (matière ↔ espèce). Demande forte (planning + cascade).
> Spec métier : `obsidian/E - Culture (spec).md`

### Spec métier

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

- [ ] Plan E1 — Parcelles + Planches + journals + images + historique journalier
- [ ] Plan E2 — Espèces + itinéraires (jours) + associations/risques/faisabilité
- [ ] Plan E3 — Lots (planche) + cascade (jours) + conflits + API planning
- [ ] Plan E4 — Récoltes multi-sessions / campagnes + webhook (+ branchement stock D)
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

La **spécification métier + transverse + settings** est complète.

1. Commencer l’**implémentation** (Catalogue Plan 1 / G1 auth), **ou**
2. Relire / valider une spec précise avant code.

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
