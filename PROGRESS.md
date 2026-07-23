# PROGRESS — Spécification chaudron-webapp

> Suivi de la **spécification** (pas de l’implémentation). Cocher une ligne quand le livrable correspondant existe et est suffisamment détaillé pour servir de base à un plan d’implémentation.
>
> **Convention** : pas de PR pour ce travail documentaire. Mettre à jour ce fichier à chaque avancée.
>
> **Ordre de construction** (cf. `obsidian/00 - Cas d'utilisation.md` §4) : A → E → D → C → B → F ; G transverse dès A.

**Dernière mise à jour** : 2026-07-23 (spec D Stock)

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
- [ ] Plan 5 — Auth multi-utilisateur + doc API/webhooks versionnée *(peut migrer vers G si on spécifie la plateforme avant)*

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

### Spec métier

- [ ] Spec `C - Production & transformation (spec).md`
- [ ] Transformation primaire C0 (matière→matière, lots, rendement, webhook)
- [ ] Production C1 (recette → produit fini, opérateur, lot, DLUO)
- [ ] Traçabilité obligatoire Parcelle → Récolte → Transformation → Produit (remontable)
- [ ] Alerte matière insuffisante
- [ ] Suivi d’avancement productions (étapes) + tableau de bord goulots
- [ ] API + webhooks `transformation.declaree`, `production.declaree`
- [ ] Écrans déclaration & suivi

### Plans

- [ ] Plan(s) d’implémentation Production & transformation

---

## B. Commercial

> Dépend de A (+ D pour déstockage). Storefront avec G.

### Spec métier

- [ ] Spec `B - Commercial (spec).md`
- [ ] Intentions de vente (année civile, priorité, CA/marge prévisionnels)
- [ ] Dérivation besoins produits → besoins matière
- [ ] Ventes réalisées (agrégées jour/produit, point de vente, API + storefront)
- [ ] Comparaison réalisé vs intention
- [ ] Historique des ventes filtrable
- [ ] Points de vente / canaux (D9)
- [ ] API Commercial + webhook `vente.realisee`
- [ ] Écrans intentions / ventes / PdV

### Plans

- [ ] Plan(s) d’implémentation Commercial

---

## F. Planification

> Arrive en dernier : agrège B, D, E.

### Spec métier

- [ ] Spec `F - Planification (spec).md`
- [ ] Proposition planning (intentions → besoins → surfaces, stock, vivaces, priorités)
- [ ] Affectation parcelles (faisabilité 🟢🟡🔴)
- [ ] Contrainte eau (affichage/filtre V1 — Q-E9 ; arbitrage auto plus tard)
- [ ] Proposition modifiable + recalcul
- [ ] Comparaison planifié vs besoin
- [ ] Rotations / pérennité (`❓` UC-F1.5 — trancher)
- [ ] API / écrans moteur de proposition

### Plans

- [ ] Plan(s) d’implémentation Planification

---

## G. Plateforme (transverse)

> Posée dès A, enrichie à chaque domaine. Spec dédiée pour unifier conventions.

### Spec métier

- [ ] Spec `G - Plateforme (spec).md`
- [ ] Conventions API REST communes (erreurs, pagination, versioning payloads)
- [ ] Auth : clé d’API + login/mot de passe multi-utilisateur (D14) ; opérateur tracé
- [ ] Catalogue des webhooks (registre, config JSON, doc contrats versionnés, retry V1 ?)
- [ ] Storefront = front de vente interne (D8) — écrans & flux
- [ ] Uploads / stockage fichiers (images parcelles — Q-E6 / guide Hostinger)
- [ ] Hors V1 explicite : module comptable (consommateur webhooks), boutique publique

### Plans

- [ ] Plan auth & webhooks (peut réutiliser / absorber Catalogue Plan 5)
- [ ] Plan storefront (avec domaine B)

---

## Transverse (T)

- [ ] Spec ou section dédiée **Recherche globale** (UC-T1)
- [ ] Spec **Tableau de bord d’accueil** (UC-T2)
- [ ] Spec **Import initial** depuis `Recettes et production - v19.xlsx` (UC-T3 / Q-T1) — souhaitable
- [ ] Trancher **Journal des modifications** (UC-T4 `❓`)
- [ ] Spec **Export CSV** basique (UC-T5)
- [ ] Trancher **Sauvegarde / restauration** (UC-T6 `❓`)
- [ ] Intégrité référentielle (UC-T7) — déjà dans spec A ; généraliser dans chaque domaine
- [ ] Spec **Statistiques** (UC-T8 / D12) : page générale + pages ventes / production / stock / culture / marges / charge

---

## Questions ouvertes à trancher (spécification)

> Source : `obsidian/01 - Décisions & questions ouvertes.md`. Cocher quand la décision est actée (et idéalement promu en Dn ou notée dans la spec concernée).

### Encore floues / à confirmer

- [ ] Q-A — Référentiel **fournisseurs** dédié vs champ texte V1 *(texte acté V1 dans D)*
- [ ] Q-C — Paramètres optionnels des transformations (température, durée…) — quels champs V1
- [ ] Q-F — Rotations / pérennité dans la proposition (UC-F1.5)
- [ ] Q-G3 — **Retry / rejeu** webhooks en cas d’échec au V1
- [ ] Q-T4 — Historique / journal des modifications
- [ ] Q-T6 — Sauvegarde / restauration
- [ ] Q-U — Rôles / permissions différenciés (reporté « plus tard » — confirmer hors V1)
- [x] Stock mini alerte matières / produits → CD-5 [[D - Stock (spec)]]
- [ ] Contact sur points de vente (UC-B3.1 `❓`)
- [ ] Import en masse des ventes (UC-B2.4 `❓`)

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

1. **Rédiger la spec C — Production & transformation** (consomme D + E), **ou**
2. **Rédiger la spec G — Plateforme** (conventions API/auth/webhooks), **ou**
3. **Rédiger la spec B — Commercial** (ventes / intentions, déstockage produit).

---

## Journal des mises à jour

| Date | Changement |
|------|------------|
| 2026-07-23 | Création de `PROGRESS.md` — inventaire initial de la spécification |
| 2026-07-23 | Spec `E - Culture (spec).md` rédigée ; checklist E coché ; plans E1–E5 listés |
| 2026-07-23 | Spec E ajustée : Parcelle seule entité ; **tout en jours** ; multi-récoltes actées ; D2 précisé |
| 2026-07-23 | Spec E / D6–D16 : **Parcelle (lettres) + Planche (numéros)** ; récoltes multi-sessions / `campagne_id` (pluie) |
| 2026-07-23 | Spec `D - Stock (spec).md` ; Q-D1/Q-D2 et `stock_mini` actés ; plans D1–D5 listés |
