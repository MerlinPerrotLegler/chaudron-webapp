---
type: spec
status: draft
created: 2026-07-23
updated: 2026-07-23
tags:
  - webapp
  - spec
  - transverse
source:
  - "00 - Cas d'utilisation"
  - "01 - Décisions & questions ouvertes"
  - "D12"
---

# Spec — Transverses (T)

Fonctions transverses : recherche, tableau de bord, import, audit, export, sauvegarde, intégrité, statistiques. Découle de [[00 - Cas d'utilisation]] §3 (UC-T*) et **D12**.

---

## 1. Périmètre V1

| UC | V1 |
|----|-----|
| T1 Recherche globale | Oui — `GET /api/search` |
| T2 Tableau de bord | Oui — page `/` après login |
| T3 Import initial Excel | Oui — **souhaitable**, outil admin one-shot / réutilisable |
| T4 Journal des modifications | Oui **léger** — `AuditLog` sur écritures clés (pas un diff Excel complet) |
| T5 Export CSV | Oui — exports par ressource |
| T6 Sauvegarde / restauration | **Sauvegarde** = export dump/archive téléchargeable ; **restauration** = hors UI V1 (procédure ops / Hostinger) |
| T7 Intégrité | Oui — déjà dans chaque domaine ; rappel transversal |
| T8 Statistiques | Oui — page générale + pages topic (D12) |

---

## 2. Décisions (Transverses)

| # | Décision |
|---|----------|
| CT-1 | Recherche : préfixe `q` min 2 car. ; résultats groupés par type (`matiere`, `recette`, `produit`, `espece`, `planche`, `client`, `lot_culture`, `commande`…) ; max 10 / type. |
| CT-2 | Dashboard : widgets configurables plus tard ; V1 fixe = alertes stock/DLUO + productions en cours + prochaines étapes culture (7–14 j) + livraisons à venir + commandes à préparer. |
| CT-3 | Import v19 : mapping déclaré feuille → entités A ; mode `dry-run` puis `commit` ; rapport d’erreurs ; idempotent sur `nom` unique (skip ou update). |
| CT-4 | AuditLog : qui / quand / entité / action (`create`\|`update`\|`archive`) / `summary` JSON (pas de full before/after obligatoire V1). |
| CT-5 | Export CSV : UTF-8, `;` séparateur (FR), une ressource à la fois. |
| CT-6 | Backup V1 : `GET /api/admin/backup` → archive JSON (ou `.sql` si dispo) des tables métier ; restore manuel. |
| CT-7 | Stats : agrégations SQL/services en lecture seule ; filtres `from`/`to` / `annee`. |

---

## 3. Recherche globale (T1)

`GET /api/search?q=`

```json
{
  "data": {
    "matieres": [{ "id", "nom", "provenance" }],
    "recettes": [...],
    "produits": [...],
    "especes": [...],
    "planches": [{ "id", "code" }],
    "clients": [...],
    "commandes": [...]
  }
}
```

UI : palette ⌘K / champ header → navigation vers la fiche.

---

## 4. Tableau de bord (T2)

Route UI `/` (ou `/dashboard`).

**Widgets V1**
1. Alertes stock / DLUO (`GET /stock/alertes`)
2. Productions `en_cours` (C)
3. Étapes culture à venir (lots E, `date_prevue` dans les N jours)
4. Livraisons / commandes (B) à J−7…J+14
5. Raccourcis : storefront, nouvelle récolte, nouvelle vente

Pas de customisation layout V1.

---

## 5. Import initial (T3)

**Source** : `Recettes et production - v19.xlsx` (feuilles type Ingredients, Recette, Conditionnement, Produit).

**Flux admin** `/admin/import`
1. Upload fichier
2. `POST /api/import/preview` → mapping + lignes OK/KO
3. `POST /api/import/commit` → crée matières, prix, recettes, ingrédients, conditionnements, produits

**Règles**
- Noms uniques : si existe → `update` des champs vides seulement **ou** skip (paramètre)
- Ne crée pas stock / ventes / culture
- Journal import dans AuditLog

Hors V1 : import fiches Obsidian plantes (peut alimenter Espèces plus tard).

---

## 6. Audit / journal (T4)

**AuditLog**
- `id`, `at`, `user_id?`, `operateur_nom?`
- `entity_type`, `entity_id`, `action`
- `summary` (JSON court : champs touchés)

Écrit depuis la couche services sur mutations.  
UI : `/admin/audit` filtrable. Pas de revert auto.

---

## 7. Export CSV (T5)

`GET /api/export/:ressource.csv?…`

Ressources V1 : `matieres`, `produits`, `ventes`, `stock-matieres`, `stock-produits`, `lots-culture`, `clients`, `commandes`.

Headers FR, dates ISO.

---

## 8. Sauvegarde (T6)

- **Backup** : endpoint admin authentifié → fichier téléchargeable (JSON zip des collections métier).
- **Restore** : hors appli V1 (import MySQL / procédure documentée dans guide ops). Pas de bouton « restaurer » destructif dans l’UI.

---

## 9. Intégrité (T7)

Rappel : chaque domaine garantit unicité, archivage, 409.  
Pas de service transverse séparé hors helpers partagés (`assertUnique`, etc.).

---

## 10. Statistiques (T8 / D12)

### 10.1 Page générale `/stats`

KPI cards : CA période, marge, nb ventes, stock alertes, lots culture actifs, productions en cours.

### 10.2 Pages topic

| Route | Contenu |
|-------|---------|
| `/stats/ventes` | CA / qty par période, produit, PdV, client ; vs intentions |
| `/stats/production` | Volumes, lots, avancement, transformations (rendements) |
| `/stats/stock` | Niveaux, rotations (mouvements), alertes |
| `/stats/culture` | Surfaces, avancement lots, récoltes, rendement réel vs prévu |
| `/stats/marges` | Revient vs vente par produit |
| `/stats/charge` | Heures MO (étapes recette + culture) agrégées par jour/semaine |

API : `GET /api/stats/:topic?from=&to=&annee=`

Graphiques simples (barres / lignes) ; export CSV du jeu affiché.

---

## 11. Plans indicatifs

1. **T1** — Search + dashboard widgets
2. **T2** — Export CSV + AuditLog
3. **T3** — Stats générale + ventes/marges
4. **T4** — Stats production/stock/culture/charge
5. **T5** — Import Excel preview/commit + backup download

---

## Liens

- [[00 - Cas d'utilisation]] · [[G - Plateforme (spec)]] · [[B - Commercial (spec)]] · [[A - Catalogue (spec)]]
