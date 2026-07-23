---
type: spec
status: draft
created: 2026-07-23
updated: 2026-07-23
tags:
  - webapp
  - spec
  - settings
  - ui
source:
  - "G - Plateforme (spec)"
  - "A - Catalogue (spec)"
  - "02 - Guide technique pour développeurs"
---

# Spec — Réglages de l’application (Settings)

Hub **Réglages** : apparence visuelle, identité, paramètres métier, et raccourcis vers la config plateforme (users, webhooks, clés API). Complète [[G - Plateforme (spec)]] et les `Parametres` du Catalogue.

---

## 1. Objet & périmètre

Une entrée de menu **Réglages** (`/settings`) regroupe :

| Section | Contenu |
|---------|---------|
| **Apparence** | Thème clair et sombre, couleurs marque, densité, logo |
| **Identité** | Nom de l’app affiché, fuseau, format dates |
| **Métier** | Taux horaire MO, `inclure_mo`, seuils DLUO / stock (liens champs existants) |
| **Compte** | Mot de passe de l’utilisateur connecté |
| **Administration** | Utilisateurs, clés API, webhooks, import, backup, audit (si droits — V1 = tous les users) |

**Hors périmètre V1**
- Multi-langue (FR uniquement)
- White-label complet / CSS arbitraire injecté
- Permissions granulaires sur les sous-pages admin

---

## 2. Décisions de conception

| # | Décision |
|---|----------|
| CS-1 | Préférences **apparence** stockées en base (`AppSettings` singleton) pour toute l’instance (ferme = un look), pas par utilisateur V1 — sauf `densite` / `sidebar_reduite` optionnellement en `localStorage`. |
| CS-2 | Palette via **CSS variables** (`--color-primary`, `--color-accent`, `--color-bg`, `--color-fg`, `--font-display`, `--font-body`). Pas de thème purple-by-default. |
| CS-3 | Logo : upload image (PNG/SVG/WebP) → `uploads/branding/logo.*` ; affiché header + storefront. |
| CS-4 | Paramètres métier **déjà** dans Catalogue/Stock (`Parametres`) : l’écran Settings les **édite** via les mêmes services (pas de double source). |
| CS-5 | Fuseau : `Europe/Paris` par défaut ; dates UI en local ; API reste dates civiles / ISO. |
| CS-6 | Typo : polices web chargées (display + body) configurables par nom de stack prédéfinie (ex. « Serif fermier », « Sans neutre ») — liste fermée V1, pas d’URL font libre. |

---

## 3. Modèle de données

**AppSettings** (singleton `id = 1`)

- **Identité** : `app_name` (défaut « Le Chaudron qui sent bon »), `timezone` (défaut `Europe/Paris`)
- **Apparence** :
  - `color_primary` (hex)
  - `color_accent` (hex)
  - `color_bg` (hex)
  - `color_fg` (hex)
  - `font_preset` enum : `serife_campagne` | `sans_lisible` | `mixte`
  - `logo_path?`
  - `radius` enum : `none` | `sm` | `md` (évite rounded-full partout)
- timestamps

Les champs métier (`taux_horaire_main_oeuvre`, `inclure_mo`, `seuil_jours_alerte_dluo`, `budget_eau_m3_an?`…) restent sur **Parametres** (A/D/F) — Settings affiche un formulaire unifié qui PATCH les bonnes tables.

---

## 4. Application visuelle (UI)

### 4.1 Layout

- Shell app : sidebar (sections Catalogue, Culture, Stock, Production, Commercial, Planification, Stats, Réglages) + topbar (recherche T1, user, lien storefront).
- Storefront : layout **minimal** (pas de sidebar lourde), gros contrôles, logo + `app_name`.

### 4.2 Injection thème

Au chargement layout racine : lire `AppSettings` → injecter variables CSS sur `:root`.  
Preview live dans `/settings/apparence` avant save.

### 4.3 Densité (localStorage)

`compact` | `confortable` — spacing des listes/tables.

---

## 5. Écrans `/settings`

1. **Apparence** — color pickers, preset fonts, upload logo, preview header
2. **Identité** — nom app, timezone
3. **Métier** — taux horaire, inclure MO, seuil DLUO, stock_mini défauts (si globaux), budget eau affiché
4. **Mon compte** — changer mot de passe
5. **Liens admin** — cards vers Utilisateurs, Clés API, Webhooks, Import, Backup, Audit

Mobile : sections en accordéon / sous-routes.

---

## 6. API

| Ressource | Méthodes |
|---|---|
| `/settings` | GET (apparence + identité + aperçu métier) |
| `/settings/apparence` | PUT |
| `/settings/identite` | PUT |
| `/settings/logo` | POST multipart, DELETE |
| `/parametres` | GET/PUT (existant A — réutilisé) |

`GET /settings` public **non** : auth requise.  
Valeurs apparence nécessaires au 1er paint : soit SSR depuis settings, soit defaults CSS puis hydrate.

---

## 7. Defaults V1 (suggestion)

| Variable | Défaut (indicatif) |
|----------|-------------------|
| primary | vert olive / végétal sombre (ex. `#3F5D4A`) |
| accent | ocre doux (ex. `#C4A35A`) — éviter terracotta cliché + cream combo |
| bg | blanc cassé très léger **ou** blanc `#FAFAF8` (pas cream #F4F1EA saturé) |
| fg | charbon `#1C1C1A` |
| font_preset | `mixte` (display serif + body sans) |

L’exploitant pourra tout retoucher dans Settings.

---

## 8. Plans indicatifs

1. **S1** — `AppSettings` + API + injection CSS
2. **S2** — Écran apparence + logo + preview
3. **S3** — Hub settings (identité, métier via Parametres, liens admin)
4. **S4** — Densité localStorage + polish storefront branding

---

## 9. Hors périmètre

- Éditeur de thème dark
- i18n
- Custom CSS libre (XSS)
- Thèmes marketplace

---

## Liens

- [[G - Plateforme (spec)]] · [[T - Transverses (spec)]] · [[A - Catalogue (spec)]] · [[02 - Guide technique pour développeurs]]
