# Design — Shell UI + Dashboard + Storefront

Date : 2026-07-24  
Statut : draft (à valider)  
Contexte : chaudron-webapp — back-office ferme PPAM « Le Chaudron qui sent bon »

## 1. Objectif

Livrer un **premier UI utilisable** sans login G1 :

1. **Shell** back-office (sidebar + topbar + thème Settings)
2. **Dashboard** `/` branché sur `GET /api/dashboard` (+ alertes stock)
3. **Storefront** `/storefront` — saisie vente marché rapide → `POST /api/ventes`

Les autres domaines (Catalogue, Culture, …) ont des **pages stub** dans la nav.

## 2. Décisions verrouillées

| # | Décision |
|---|----------|
| UI-1 | Stack : **Next.js App Router + Tailwind + CSS variables** injectées depuis `AppSettings` |
| UI-2 | Palette défaut : primary `#3F5D4A`, accent `#C4A35A`, bg `#FAFAF8`, fg `#1C1C1A` (spec S) |
| UI-3 | Fonts : preset `mixte` — display serif (ex. Fraunces / Source Serif) + body sans (ex. Source Sans 3) via `next/font` ou Google fonts |
| UI-4 | Auth UI V1 : clé API via `localStorage` (`chaudron_api_key`) préremplie depuis `NEXT_PUBLIC_API_KEY` si présent ; pas de login session |
| UI-5 | Logique métier **uniquement** via fetch API existante (CG-1) — pas d’appels Prisma depuis les composants |
| UI-6 | Ordre : Shell+Dashboard → Storefront ; Catalogue CRUD UI plus tard |
| UI-7 | Mobile : sidebar repliable ; storefront prioritaire tactile (gros boutons) |

## 3. Architecture fichiers

```
src/
  app/
    layout.tsx                 # root : fonts, ThemeProvider, globals.css
    (backoffice)/
      layout.tsx               # Shell (sidebar + topbar)
      page.tsx                 # Dashboard
      catalogue/page.tsx       # stub
      culture/page.tsx         # stub
      stock/page.tsx           # stub
      production/page.tsx      # stub
      commercial/page.tsx      # stub
      planification/page.tsx   # stub
      stats/page.tsx           # stub
      settings/page.tsx        # stub léger (lien API settings)
    storefront/
      layout.tsx               # layout minimal (pas de sidebar lourde)
      page.tsx                 # vente rapide
  components/
    shell/Sidebar.tsx
    shell/Topbar.tsx
    shell/ThemeVars.tsx        # injecte style :root depuis settings
    dashboard/DashboardWidgets.tsx
    storefront/VenteForm.tsx
    ui/…                       # Button, Input, Select, Card, Alert (minimals)
  lib/
    api-client.ts              # fetch JSON + x-api-key + erreurs {code,message}
```

## 4. Shell

### Sidebar
Sections (ordre) : Dashboard · Catalogue · Culture · Stock · Production · Commercial · Planification · Stats · Réglages.  
Raccourci Storefront en haut ou dans topbar.

### Topbar
- Champ recherche → `GET /api/search?q=` (palette simple, résultats groupés)
- Lien Storefront
- Indicateur clé API (définir / effacer)

### Thème
Au mount layout back-office : `GET /api/settings` → appliquer :

```css
:root {
  --color-primary: …;
  --color-accent: …;
  --color-bg: …;
  --color-fg: …;
  --radius: …; /* none|sm|md → 0|4px|8px */
}
```

Fallback = defaults AppSettings si API KO.

## 5. Dashboard `/`

Widgets (données `GET /api/dashboard`) :

1. Alertes stock / DLUO  
2. Productions `en_cours`  
3. Étapes culture à venir (7 j)  
4. Livraisons / commandes à préparer  
5. Raccourcis : Storefront · (stubs Récolte / Vente)

États vides : message court + CTA vers le domaine concerné.

## 6. Storefront `/storefront`

Flux (CG-8) :

1. Choisir **produit fini** (liste `GET /api/produits?actif=true`)  
2. Quantité  
3. Prix (défaut catalogue, surchargeable)  
4. **Point de vente** (liste `GET /api/points-vente`)  
5. Client optionnel  
6. Valider → `POST /api/ventes`  
7. Feedback succès / erreur 409 stock insuffisant

Layout : une colonne, contrôles larges, pas de sidebar. Logo + `appName` en en-tête.

## 7. Hors périmètre de ce lot

- Login / sessions (G1)  
- CRUD Catalogue / Culture / …  
- Upload logo Settings  
- Tests E2E Playwright (optionnel plus tard)  
- Dark mode

## 8. Critères de succès

- [ ] `npm run dev` → `/` affiche le shell + widgets (ou états vides)  
- [ ] Thème CSS vars visibles (primary sur nav active)  
- [ ] `/storefront` permet une vente si stock + PdV existent  
- [ ] Stub pages domaines accessibles depuis la nav  
- [ ] Aucune logique métier hors services/API  

## 9. Risques / notes

- MySQL distant lent → UI doit gérer loading / erreur réseau clairement.  
- `NEXT_PUBLIC_API_KEY` exposé au client : acceptable V1 mono-utilisateur ferme ; remplacé par session G1.
