# Shell UI + Dashboard + Storefront — Plan d’implémentation

> **For agentic workers:** exécution inline dans cette session.

**Goal:** Shell back-office + dashboard `/` + storefront `/storefront` branchés sur l’API existante.

**Architecture:** App Router groups `(backoffice)` et `storefront`. Tailwind + CSS vars depuis `AppSettings`. Client `apiFetch` avec `x-api-key`. Zéro logique métier dans les pages.

**Tech Stack:** Next.js 14 · React 18 · Tailwind 3 · `next/font` · Vitest inchangé

## Global Constraints

- Vocabulaire domaine inchangé ; API REST existante uniquement
- Jamais de secret dans le repo ; `NEXT_PUBLIC_API_KEY` optionnel pour bootstrap
- Commits français atomiques `feat:` / `chore:`
- Spec : `docs/superpowers/specs/2026-07-24-ui-shell-dashboard-storefront-design.md`

---

### Task 1: Tailwind + api-client + theme helpers

**Files:**
- Create: `tailwind.config.ts`, `postcss.config.mjs`, `src/app/globals.css`
- Create: `src/lib/api-client.ts`, `src/lib/theme.ts`
- Modify: `package.json`, `.env.example`, `src/app/layout.tsx`

- [ ] Install `tailwindcss postcss autoprefixer` ; config content `./src/**/*`
- [ ] `apiFetch<T>(path, init?)` : base relative, header `x-api-key` depuis localStorage / `NEXT_PUBLIC_API_KEY`, parse `{code,message}`
- [ ] `themeToCssVars(settings)` map AppSettings → string CSS
- [ ] Commit `chore: Tailwind + client API UI`

### Task 2: Shell back-office

**Files:**
- Create: `src/components/shell/{Sidebar,Topbar,ThemeVars,ApiKeyGate}.tsx`
- Create: `src/app/(backoffice)/layout.tsx`
- Create stubs: `catalogue|culture|stock|production|commercial|planification|stats|settings/page.tsx`

- [ ] Sidebar nav + Topbar (lien storefront, recherche simple)
- [ ] ThemeVars fetch `/api/settings` au mount
- [ ] Commit `feat: shell back-office sidebar et thème`

### Task 3: Dashboard

**Files:**
- Create: `src/components/dashboard/DashboardWidgets.tsx`
- Create: `src/app/(backoffice)/page.tsx`
- Remove/replace: `src/app/page.tsx` (déplacé dans group)

- [ ] Fetch `/api/dashboard`, widgets + empty states
- [ ] Commit `feat: dashboard widgets depuis API`

### Task 4: Storefront

**Files:**
- Create: `src/app/storefront/layout.tsx`, `page.tsx`
- Create: `src/components/storefront/VenteForm.tsx`

- [ ] Form produit / qty / prix / PdV / client? → POST `/api/ventes`
- [ ] Commit `feat: storefront vente marché rapide`

### Task 5: Polish + PROGRESS

- [ ] Vérifier `npm run build`
- [ ] Maj PROGRESS.md (~UI P7 partiel)
- [ ] Commit `chore: maj PROGRESS UI shell`
