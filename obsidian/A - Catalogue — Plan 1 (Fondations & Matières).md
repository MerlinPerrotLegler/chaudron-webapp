# Catalogue — Plan 1 : Fondations & API Matières

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Poser les fondations du dépôt de l'app (Next.js + MySQL) et livrer l'**API REST des Matières** de bout en bout (CRUD, provenance, historique de prix, intégrité), testée.

**Architecture:** App **Next.js App Router** (TypeScript) servant l'API via Route Handlers. Logique métier isolée dans une **couche services** (fonctions pures + accès Prisma) testable sans serveur HTTP. **Prisma** gère le schéma MySQL et les migrations. Validation par **Zod**, tests par **Vitest** contre une base MySQL de test.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Prisma ORM, MySQL/MariaDB, Zod, Vitest, Node 20.

## Global Constraints

- Runtime **Node 20** ; l'app écoute sur `process.env.PORT` en prod (Hostinger) — géré par Next `start`.
- Base **MySQL/MariaDB** uniquement (pas de SQLite) ; connexion via `DATABASE_URL`.
- **Aucun secret commité** : `.env*` dans `.gitignore` ; secrets via variables d'env.
- API : réponses JSON, erreurs normalisées **`{ code, message, details? }`**, incohérence d'intégrité → **HTTP 409**.
- Vocabulaire figé (provenance) : `fermiere` / `importation` / `base`.
- Nouveau **dépôt dédié** `chaudron-webapp` (séparé du vault Obsidian).
- Ce plan ne construit **pas** l'UI, l'auth complète, ni les Recettes/Produits (plans suivants) ; le **schéma Prisma** couvre néanmoins tout le Catalogue dès maintenant.

---

## Structure des fichiers (Plan 1)

- `package.json`, `tsconfig.json`, `next.config.mjs`, `.gitignore`, `.env.example` — projet
- `vitest.config.ts`, `test/setup.ts`, `test/db.ts` — harnais de test
- `prisma/schema.prisma` — schéma complet du Catalogue + migration
- `src/lib/prisma.ts` — client Prisma singleton
- `src/lib/errors.ts` — `AppError`
- `src/lib/api.ts` — helpers de réponse (`ok`, `created`, `fail`, `paginated`)
- `src/lib/webhooks.ts` — `resolveHooks`, `emit`
- `src/lib/validation/matiere.ts` — schémas Zod Matière
- `src/services/matiere.ts` — logique métier Matière
- `src/services/matierePrix.ts` — historique de prix
- `src/app/api/matieres/route.ts` — `GET` (liste), `POST`
- `src/app/api/matieres/[id]/route.ts` — `GET`, `PUT`, `DELETE`(archive)
- `src/app/api/matieres/[id]/prix/route.ts` — `GET`, `POST`
- `src/app/api/matieres/[id]/usages/route.ts` — `GET`

---

### Task 1 : Scaffolding du projet

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `.gitignore`, `.env.example`, `.env.test`, `vitest.config.ts`, `src/app/api/health/route.ts`
- Test: `test/health.test.ts`

**Interfaces:**
- Produces: projet Next.js exécutable ; `GET /api/health` → `{ status: "ok" }` ; commande `npm test` opérationnelle (Vitest).

- [ ] **Step 1 : Initialiser le dépôt et les dépendances**

```bash
mkdir chaudron-webapp && cd chaudron-webapp && git init
npm init -y
npm install next@14 react react-dom zod @prisma/client
npm install -D typescript @types/node @types/react prisma vitest @vitest/coverage-v8
```

- [ ] **Step 2 : Fichiers de configuration**

`tsconfig.json` :
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "jsx": "preserve",
    "resolveJsonModule": true,
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src", "test", "next-env.d.ts"],
  "exclude": ["node_modules"]
}
```

`next.config.mjs` :
```js
/** @type {import('next').NextConfig} */
const nextConfig = { output: 'standalone' };
export default nextConfig;
```

`.gitignore` :
```
node_modules/
.next/
.env
.env.*
!.env.example
coverage/
```

`.env.example` :
```
DATABASE_URL="mysql://user:password@localhost:3306/chaudron"
API_KEY="change-me"
WEBHOOKS_CONFIG_PATH="./webhooks.config.json"
```

`.env.test` (base de test locale ; adapter les identifiants) :
```
DATABASE_URL="mysql://root:root@localhost:3306/chaudron_test"
API_KEY="test-key"
WEBHOOKS_CONFIG_PATH="./test/webhooks.test.json"
```

`vitest.config.ts` :
```ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./test/setup.ts'],
    fileParallelism: false,
    env: { NODE_ENV: 'test' },
  },
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
});
```

Ajouter à `package.json` les scripts :
```json
"scripts": {
  "dev": "next dev",
  "build": "prisma generate && next build",
  "start": "next start",
  "test": "vitest run",
  "db:test:reset": "dotenv -e .env.test -- prisma migrate reset --force --skip-seed"
}
```

- [ ] **Step 3 : Écrire le test de santé (échoue d'abord)**

`test/health.test.ts` :
```ts
import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/health/route';

describe('GET /api/health', () => {
  it('renvoie status ok', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ status: 'ok' });
  });
});
```

- [ ] **Step 4 : Lancer le test — il doit échouer**

Run: `npm test`
Expected: FAIL (module `@/app/api/health/route` introuvable).

- [ ] **Step 5 : Implémenter le handler**

`src/app/api/health/route.ts` :
```ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'ok' });
}
```

- [ ] **Step 6 : Lancer le test — il doit passer**

Run: `npm test`
Expected: PASS.

- [ ] **Step 7 : Commit**

```bash
git add -A && git commit -m "chore: scaffold Next.js + Vitest, health endpoint"
```

---

### Task 2 : Schéma Prisma complet du Catalogue + migration

**Files:**
- Create: `prisma/schema.prisma`, `src/lib/prisma.ts`
- Test: `test/schema.test.ts`

**Interfaces:**
- Produces: modèles Prisma `Matiere`, `MatierePrix`, `Espece`, `Recette`, `RecetteIngredient`, `EtapeRecette`, `Equipement`, `EtapeEquipement`, `CategorieReglementaire`, `Conditionnement`, `ProduitFini`, `Parametres` ; enums `Provenance`, `UniteAchat`, `BesoinEau`, `FamilleRecette`, `TypeRecette`, `ModeQuantite` ; client exporté `prisma` depuis `@/lib/prisma`.

- [ ] **Step 1 : Écrire le schéma Prisma**

`prisma/schema.prisma` :
```prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "mysql"; url = env("DATABASE_URL") }

enum Provenance { fermiere importation base }
enum UniteAchat { kg L piece }
enum BesoinEau { faible modere eleve }
enum FamilleRecette { sec sirop sel sucre vinaigre lacto moutarde tabasco tisane cosmetique autre }
enum TypeRecette { transformation simple }
enum ModeQuantite { proportions absolu }

model Espece {
  id        Int      @id @default(autoincrement())
  nom       String   @unique
  createdAt DateTime @default(now())
  matieres  Matiere[]
}

model Matiere {
  id            Int          @id @default(autoincrement())
  nom           String       @unique
  nomLatin      String?
  provenance    Provenance
  uniteAchat    UniteAchat   @default(kg)
  ratioSechage  Float?
  pctEau        Float?
  besoinEau     BesoinEau?
  source        String?
  fournisseur   String?
  lien          String?
  prixVenteKg   Float?
  especeId      Int?         // FK logique vers Espece (domaine E) ; contrainte activée plus tard
  espece        Espece?      @relation(fields: [especeId], references: [id])
  archivee      Boolean      @default(false)
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  prix          MatierePrix[]
  ingredients   RecetteIngredient[]
}

model MatierePrix {
  id        Int      @id @default(autoincrement())
  matiereId Int
  matiere   Matiere  @relation(fields: [matiereId], references: [id])
  date      DateTime @db.Date
  prix      Float
  createdAt DateTime @default(now())
  @@index([matiereId, date])
}

model CategorieReglementaire {
  id        Int       @id @default(autoincrement())
  nom       String    @unique
  lienFiche String?
  recettes  Recette[]
}

model Recette {
  id                    Int          @id @default(autoincrement())
  nom                   String       @unique
  description           String?      @db.Text
  tags                  Json?
  famille               FamilleRecette
  type                  TypeRecette  @default(transformation)
  categorieId           Int?
  categorie             CategorieReglementaire? @relation(fields: [categorieId], references: [id])
  modeQuantite          ModeQuantite @default(proportions)
  quantiteSortie        Float?
  uniteSortie           String?
  lotRefLibelle         String?
  rendementRatioTravail Float        @default(1)
  notesVariante         String?      @db.Text
  archivee              Boolean      @default(false)
  createdAt             DateTime     @default(now())
  updatedAt             DateTime     @updatedAt
  ingredients           RecetteIngredient[]
  etapes                EtapeRecette[]
  produits              ProduitFini[]
}

model RecetteIngredient {
  id           Int     @id @default(autoincrement())
  recetteId    Int
  recette      Recette @relation(fields: [recetteId], references: [id])
  matiereId    Int
  matiere      Matiere @relation(fields: [matiereId], references: [id])
  ordre        Int     @default(0)
  quantite     Float
  unite        String
  poidsEquivG  Float?
}

model EtapeRecette {
  id              Int     @id @default(autoincrement())
  recetteId       Int
  recette         Recette @relation(fields: [recetteId], references: [id])
  ordre           Int     @default(0)
  description     String  @db.Text
  tempsMainOeuvre Int     @default(0)
  tempsAttente    Int     @default(0)
  parametres      Json?
  equipements     EtapeEquipement[]
}

model Equipement {
  id     Int    @id @default(autoincrement())
  nom    String @unique
  etapes EtapeEquipement[]
}

model EtapeEquipement {
  etapeId      Int
  equipementId Int
  etape        EtapeRecette @relation(fields: [etapeId], references: [id])
  equipement   Equipement   @relation(fields: [equipementId], references: [id])
  @@id([etapeId, equipementId])
}

model Conditionnement {
  id            Int      @id @default(autoincrement())
  nom           String   @unique
  contenance    Float?
  poidsNet      Float?
  coutContenant Float    @default(0)
  coutBouchon   Float    @default(0)
  coutEtiquette Float    @default(0)
  coutTotal     Float    @default(0)
  lienContenant String?
  lienBouchon   String?
  archive       Boolean  @default(false)
  produits      ProduitFini[]
}

model ProduitFini {
  id                Int      @id @default(autoincrement())
  recetteId         Int
  recette           Recette  @relation(fields: [recetteId], references: [id])
  conditionnementId Int
  conditionnement   Conditionnement @relation(fields: [conditionnementId], references: [id])
  poidsUnite        Float
  prixVenteUnite    Float?
  actif             Boolean  @default(true)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model Parametres {
  id                    Int   @id @default(1)
  tauxHoraireMainOeuvre Float @default(0)
  inclureMo             Boolean @default(true)
}
```

- [ ] **Step 2 : Client Prisma singleton**

`src/lib/prisma.ts` :
```ts
import { PrismaClient } from '@prisma/client';

const g = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = g.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') g.prisma = prisma;
```

- [ ] **Step 3 : Créer la base de test et la migration**

```bash
# créer la base de test dans MySQL au préalable : CREATE DATABASE chaudron_test;
npm install -D dotenv-cli
npx dotenv -e .env.test -- prisma migrate dev --name init_catalogue
```
Expected: migration `init_catalogue` créée, client généré.

- [ ] **Step 4 : Test de fumée du schéma (échoue si migration absente)**

`test/schema.test.ts` :
```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';
import { resetDb } from './db';

beforeEach(resetDb);

describe('schéma Matiere', () => {
  it('crée et relit une matière', async () => {
    const m = await prisma.matiere.create({
      data: { nom: 'Thym', provenance: 'fermiere', uniteAchat: 'kg' },
    });
    expect(m.id).toBeGreaterThan(0);
    expect(m.archivee).toBe(false);
  });
});
```

- [ ] **Step 5 : Harnais de test DB**

`test/db.ts` :
```ts
import { prisma } from '@/lib/prisma';

// Ordre de suppression respectant les FK
export async function resetDb() {
  await prisma.etapeEquipement.deleteMany();
  await prisma.etapeRecette.deleteMany();
  await prisma.recetteIngredient.deleteMany();
  await prisma.produitFini.deleteMany();
  await prisma.recette.deleteMany();
  await prisma.matierePrix.deleteMany();
  await prisma.matiere.deleteMany();
  await prisma.espece.deleteMany();
  await prisma.conditionnement.deleteMany();
  await prisma.categorieReglementaire.deleteMany();
  await prisma.equipement.deleteMany();
}
```

`test/setup.ts` :
```ts
import { config } from 'dotenv';
config({ path: '.env.test' });
```

`test/webhooks.test.json` :
```json
{}
```

- [ ] **Step 6 : Lancer le test — il doit passer**

Run: `npm test`
Expected: PASS.

- [ ] **Step 7 : Commit**

```bash
git add -A && git commit -m "feat: prisma schema for full catalogue + test db harness"
```

---

### Task 3 : Fondations API (erreurs, réponses, clé d'API)

**Files:**
- Create: `src/lib/errors.ts`, `src/lib/api.ts`
- Test: `test/api-helpers.test.ts`

**Interfaces:**
- Produces:
  - `class AppError extends Error { code: string; status: number; details?: unknown }`
  - `ok<T>(data: T, status?: number): NextResponse`
  - `created<T>(data: T): NextResponse`
  - `fail(code: string, message: string, status: number, details?: unknown): NextResponse`
  - `paginated<T>(items: T[], total: number, page: number, pageSize: number): NextResponse`
  - `requireApiKey(req: Request): void` (lève `AppError('unauthorized', 401)` si clé absente/incorrecte)
  - `handle(fn): Promise<NextResponse>` — enveloppe qui transforme `AppError`/`ZodError` en réponses normalisées.

- [ ] **Step 1 : Écrire les tests (échouent d'abord)**

`test/api-helpers.test.ts` :
```ts
import { describe, it, expect } from 'vitest';
import { AppError } from '@/lib/errors';
import { fail, paginated, requireApiKey, handle } from '@/lib/api';

describe('helpers API', () => {
  it('fail renvoie un corps normalisé', async () => {
    const res = fail('not_found', 'absent', 404);
    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toEqual({ code: 'not_found', message: 'absent' });
  });

  it('paginated expose les métadonnées', async () => {
    const res = paginated([1, 2], 5, 1, 2);
    await expect(res.json()).resolves.toEqual({ items: [1, 2], total: 5, page: 1, pageSize: 2 });
  });

  it('requireApiKey lève si la clé est absente', () => {
    const req = new Request('http://x/api/matieres');
    expect(() => requireApiKey(req)).toThrowError(AppError);
  });

  it('requireApiKey accepte la bonne clé', () => {
    const req = new Request('http://x/api/matieres', { headers: { 'x-api-key': 'test-key' } });
    expect(() => requireApiKey(req)).not.toThrow();
  });

  it('handle convertit AppError en réponse', async () => {
    const res = await handle(async () => { throw new AppError('conflict', 'déjà là', 409); });
    expect(res.status).toBe(409);
    await expect(res.json()).resolves.toEqual({ code: 'conflict', message: 'déjà là' });
  });
});
```

- [ ] **Step 2 : Lancer — doit échouer**

Run: `npm test test/api-helpers.test.ts`
Expected: FAIL (modules absents).

- [ ] **Step 3 : Implémenter `errors.ts`**

```ts
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 400,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
```

- [ ] **Step 4 : Implémenter `api.ts`**

```ts
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError } from './errors';

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data as object, { status });
}
export function created<T>(data: T) {
  return NextResponse.json(data as object, { status: 201 });
}
export function fail(code: string, message: string, status: number, details?: unknown) {
  return NextResponse.json(details === undefined ? { code, message } : { code, message, details }, { status });
}
export function paginated<T>(items: T[], total: number, page: number, pageSize: number) {
  return NextResponse.json({ items, total, page, pageSize });
}
export function requireApiKey(req: Request) {
  const key = req.headers.get('x-api-key');
  if (!key || key !== process.env.API_KEY) {
    throw new AppError('unauthorized', 'Clé d’API manquante ou invalide', 401);
  }
}
export async function handle(fn: () => Promise<NextResponse>) {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof AppError) return fail(e.code, e.message, e.status, e.details);
    if (e instanceof ZodError) return fail('validation', 'Requête invalide', 422, e.flatten());
    console.error(e);
    return fail('internal', 'Erreur interne', 500);
  }
}
```

- [ ] **Step 5 : Lancer — doit passer**

Run: `npm test test/api-helpers.test.ts`
Expected: PASS.

- [ ] **Step 6 : Commit**

```bash
git add -A && git commit -m "feat: API foundations (errors, responses, api-key)"
```

---

### Task 4 : Créer une matière (validation + intégrité)

**Files:**
- Create: `src/lib/validation/matiere.ts`, `src/services/matiere.ts`, `src/app/api/matieres/route.ts`
- Test: `test/matiere-create.test.ts`

**Interfaces:**
- Consumes: `prisma`, `AppError`, helpers API.
- Produces:
  - `matiereCreateSchema` (Zod) → `MatiereCreateInput`
  - `createMatiere(input: MatiereCreateInput): Promise<Matiere>` — règles : `nom` unique (sinon `AppError('conflict', …, 409)`), `provenance='fermiere' ⇒ especeId requis` (sinon `AppError('validation', …, 422)`).
  - Route `POST /api/matieres`.

- [ ] **Step 1 : Écrire les tests (échouent d'abord)**

`test/matiere-create.test.ts` :
```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { resetDb } from './db';
import { createMatiere } from '@/services/matiere';
import { AppError } from '@/lib/errors';

beforeEach(resetDb);

describe('createMatiere', () => {
  it('crée une matière d’importation', async () => {
    const m = await createMatiere({ nom: 'Poivre', provenance: 'importation', uniteAchat: 'kg' });
    expect(m.nom).toBe('Poivre');
    expect(m.provenance).toBe('importation');
  });

  it('refuse un nom en doublon (409)', async () => {
    await createMatiere({ nom: 'Sel', provenance: 'base', uniteAchat: 'kg' });
    await expect(createMatiere({ nom: 'Sel', provenance: 'base', uniteAchat: 'kg' }))
      .rejects.toMatchObject({ code: 'conflict', status: 409 });
  });

  it('exige especeId quand provenance=fermiere (422)', async () => {
    await expect(createMatiere({ nom: 'Thym', provenance: 'fermiere', uniteAchat: 'kg' }))
      .rejects.toMatchObject({ code: 'validation', status: 422 });
  });
});
```

- [ ] **Step 2 : Lancer — doit échouer**

Run: `npm test test/matiere-create.test.ts`
Expected: FAIL (modules absents).

- [ ] **Step 3 : Schéma Zod**

`src/lib/validation/matiere.ts` :
```ts
import { z } from 'zod';

export const matiereCreateSchema = z.object({
  nom: z.string().min(1),
  nomLatin: z.string().optional(),
  provenance: z.enum(['fermiere', 'importation', 'base']),
  uniteAchat: z.enum(['kg', 'L', 'piece']).optional(), // défaut 'kg' porté par la colonne Prisma
  ratioSechage: z.number().positive().optional(),
  pctEau: z.number().min(0).max(100).optional(),
  besoinEau: z.enum(['faible', 'modere', 'eleve']).optional(),
  source: z.string().optional(),
  fournisseur: z.string().optional(),
  lien: z.string().url().optional(),
  prixVenteKg: z.number().nonnegative().optional(),
  especeId: z.number().int().positive().optional(),
});
export type MatiereCreateInput = z.infer<typeof matiereCreateSchema>;
```

- [ ] **Step 4 : Service `createMatiere`**

`src/services/matiere.ts` :
```ts
import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import type { MatiereCreateInput } from '@/lib/validation/matiere';

export async function createMatiere(input: MatiereCreateInput) {
  if (input.provenance === 'fermiere' && !input.especeId) {
    throw new AppError('validation', 'especeId est requis pour une matière fermière', 422);
  }
  const existing = await prisma.matiere.findUnique({ where: { nom: input.nom } });
  if (existing) throw new AppError('conflict', `Une matière nommée « ${input.nom} » existe déjà`, 409);
  return prisma.matiere.create({ data: input });
}
```

- [ ] **Step 5 : Lancer — doit passer**

Run: `npm test test/matiere-create.test.ts`
Expected: PASS.

- [ ] **Step 6 : Route POST**

`src/app/api/matieres/route.ts` :
```ts
import { requireApiKey, created, handle } from '@/lib/api';
import { matiereCreateSchema } from '@/lib/validation/matiere';
import { createMatiere } from '@/services/matiere';

export async function POST(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    const body = matiereCreateSchema.parse(await req.json());
    const m = await createMatiere(body);
    return created(m);
  });
}
```

- [ ] **Step 7 : Commit**

```bash
git add -A && git commit -m "feat: create matiere (validation, integrity, POST route)"
```

---

### Task 5 : Lister & lire les matières

**Files:**
- Modify: `src/services/matiere.ts`, `src/app/api/matieres/route.ts`
- Create: `src/app/api/matieres/[id]/route.ts`
- Test: `test/matiere-read.test.ts`

**Interfaces:**
- Produces:
  - `listMatieres(params: { provenance?: Provenance; page?: number; pageSize?: number }): Promise<{ items: Matiere[]; total: number; page: number; pageSize: number }>` (exclut les archivées par défaut).
  - `getMatiere(id: number): Promise<Matiere>` (lève `AppError('not_found', …, 404)` si absente).
  - Route `GET /api/matieres` (filtre `provenance`, pagination) et `GET /api/matieres/[id]`.

- [ ] **Step 1 : Écrire les tests (échouent d'abord)**

`test/matiere-read.test.ts` :
```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { resetDb } from './db';
import { createMatiere, listMatieres, getMatiere } from '@/services/matiere';

beforeEach(async () => {
  await resetDb();
  await createMatiere({ nom: 'Sel', provenance: 'base', uniteAchat: 'kg' });
  await createMatiere({ nom: 'Poivre', provenance: 'importation', uniteAchat: 'kg' });
});

describe('lecture des matières', () => {
  it('liste toutes les matières non archivées', async () => {
    const r = await listMatieres({});
    expect(r.total).toBe(2);
    expect(r.items).toHaveLength(2);
  });

  it('filtre par provenance', async () => {
    const r = await listMatieres({ provenance: 'base' });
    expect(r.total).toBe(1);
    expect(r.items[0].nom).toBe('Sel');
  });

  it('getMatiere lève 404 si absente', async () => {
    await expect(getMatiere(999999)).rejects.toMatchObject({ code: 'not_found', status: 404 });
  });
});
```

- [ ] **Step 2 : Lancer — doit échouer**

Run: `npm test test/matiere-read.test.ts`
Expected: FAIL (fonctions absentes).

- [ ] **Step 3 : Étendre le service**

Ajouter à `src/services/matiere.ts` :
```ts
import type { Provenance } from '@prisma/client';

export async function listMatieres(params: { provenance?: Provenance; page?: number; pageSize?: number }) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 50;
  const where = { archivee: false, ...(params.provenance ? { provenance: params.provenance } : {}) };
  const [items, total] = await Promise.all([
    prisma.matiere.findMany({ where, orderBy: { nom: 'asc' }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.matiere.count({ where }),
  ]);
  return { items, total, page, pageSize };
}

export async function getMatiere(id: number) {
  const m = await prisma.matiere.findUnique({ where: { id } });
  if (!m) throw new AppError('not_found', `Matière ${id} introuvable`, 404);
  return m;
}
```

- [ ] **Step 4 : Lancer — doit passer**

Run: `npm test test/matiere-read.test.ts`
Expected: PASS.

- [ ] **Step 5 : Remplacer le contenu de `src/app/api/matieres/route.ts` (GET + POST)**

Fichier complet :
```ts
import { requireApiKey, created, paginated, handle } from '@/lib/api';
import { matiereCreateSchema } from '@/lib/validation/matiere';
import { createMatiere, listMatieres } from '@/services/matiere';
import type { Provenance } from '@prisma/client';

export async function GET(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    const url = new URL(req.url);
    const provenance = url.searchParams.get('provenance') as Provenance | null;
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '50');
    const r = await listMatieres({ provenance: provenance ?? undefined, page, pageSize });
    return paginated(r.items, r.total, r.page, r.pageSize);
  });
}

export async function POST(req: Request) {
  return handle(async () => {
    requireApiKey(req);
    const body = matiereCreateSchema.parse(await req.json());
    return created(await createMatiere(body));
  });
}
```

- [ ] **Step 6 : Route GET par id**

`src/app/api/matieres/[id]/route.ts` :
```ts
import { requireApiKey, ok, handle } from '@/lib/api';
import { getMatiere } from '@/services/matiere';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    const m = await getMatiere(Number(params.id));
    return ok(m);
  });
}
```

- [ ] **Step 7 : Commit**

```bash
git add -A && git commit -m "feat: list (filter/paginate) and read matiere by id"
```

---

### Task 6 : Modifier, archiver & usages

**Files:**
- Modify: `src/services/matiere.ts`, `src/lib/validation/matiere.ts`, `src/app/api/matieres/[id]/route.ts`
- Create: `src/app/api/matieres/[id]/usages/route.ts`
- Test: `test/matiere-update-archive.test.ts`

**Interfaces:**
- Produces:
  - `matiereUpdateSchema` = `matiereCreateSchema.partial()` → `MatiereUpdateInput`
  - `updateMatiere(id: number, input: MatiereUpdateInput): Promise<Matiere>`
  - `getMatiereUsages(id: number): Promise<{ recettes: { id: number; nom: string }[] }>`
  - `archiveMatiere(id: number): Promise<Matiere>` — si utilisée par une recette non archivée → `AppError('conflict', …, 409, { recettes })`.
  - Routes `PUT` et `DELETE` sur `/api/matieres/[id]`, `GET /api/matieres/[id]/usages`.

- [ ] **Step 1 : Écrire les tests (échouent d'abord)**

`test/matiere-update-archive.test.ts` :
```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';
import { resetDb } from './db';
import { createMatiere, updateMatiere, archiveMatiere, getMatiereUsages } from '@/services/matiere';

beforeEach(resetDb);

describe('update/archive matiere', () => {
  it('met à jour un champ', async () => {
    const m = await createMatiere({ nom: 'Sel', provenance: 'base', uniteAchat: 'kg' });
    const u = await updateMatiere(m.id, { fournisseur: 'Guérande' });
    expect(u.fournisseur).toBe('Guérande');
  });

  it('archive une matière non référencée', async () => {
    const m = await createMatiere({ nom: 'Sucre', provenance: 'base', uniteAchat: 'kg' });
    const a = await archiveMatiere(m.id);
    expect(a.archivee).toBe(true);
  });

  it('refuse d’archiver une matière utilisée (409) et la liste dans usages', async () => {
    const m = await createMatiere({ nom: 'Thym séché', provenance: 'importation', uniteAchat: 'kg' });
    const r = await prisma.recette.create({ data: { nom: 'Herbes', famille: 'sec', type: 'transformation' } });
    await prisma.recetteIngredient.create({ data: { recetteId: r.id, matiereId: m.id, quantite: 1, unite: 'part' } });
    await expect(archiveMatiere(m.id)).rejects.toMatchObject({ code: 'conflict', status: 409 });
    const usages = await getMatiereUsages(m.id);
    expect(usages.recettes).toEqual([{ id: r.id, nom: 'Herbes' }]);
  });
});
```

- [ ] **Step 2 : Lancer — doit échouer**

Run: `npm test test/matiere-update-archive.test.ts`
Expected: FAIL.

- [ ] **Step 3 : Schéma de mise à jour**

Ajouter à `src/lib/validation/matiere.ts` :
```ts
export const matiereUpdateSchema = matiereCreateSchema.partial();
export type MatiereUpdateInput = z.infer<typeof matiereUpdateSchema>;
```

- [ ] **Step 4 : Étendre le service**

Ajouter à `src/services/matiere.ts` :
```ts
import type { MatiereUpdateInput } from '@/lib/validation/matiere';

export async function updateMatiere(id: number, input: MatiereUpdateInput) {
  await getMatiere(id); // 404 si absente
  if (input.nom) {
    const clash = await prisma.matiere.findFirst({ where: { nom: input.nom, NOT: { id } } });
    if (clash) throw new AppError('conflict', `Une matière nommée « ${input.nom} » existe déjà`, 409);
  }
  return prisma.matiere.update({ where: { id }, data: input });
}

export async function getMatiereUsages(id: number) {
  const liens = await prisma.recetteIngredient.findMany({
    where: { matiereId: id, recette: { archivee: false } },
    select: { recette: { select: { id: true, nom: true } } },
    distinct: ['recetteId'],
  });
  return { recettes: liens.map((l) => l.recette) };
}

export async function archiveMatiere(id: number) {
  await getMatiere(id);
  const usages = await getMatiereUsages(id);
  if (usages.recettes.length > 0) {
    throw new AppError('conflict', 'Matière utilisée par des recettes actives', 409, usages);
  }
  return prisma.matiere.update({ where: { id }, data: { archivee: true } });
}
```

- [ ] **Step 5 : Lancer — doit passer**

Run: `npm test test/matiere-update-archive.test.ts`
Expected: PASS.

- [ ] **Step 6 : Routes PUT/DELETE + usages**

Ajouter à `src/app/api/matieres/[id]/route.ts` :
```ts
import { matiereUpdateSchema } from '@/lib/validation/matiere';
import { updateMatiere, archiveMatiere } from '@/services/matiere';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    const body = matiereUpdateSchema.parse(await req.json());
    return ok(await updateMatiere(Number(params.id), body));
  });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    return ok(await archiveMatiere(Number(params.id)));
  });
}
```

`src/app/api/matieres/[id]/usages/route.ts` :
```ts
import { requireApiKey, ok, handle } from '@/lib/api';
import { getMatiereUsages } from '@/services/matiere';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    return ok(await getMatiereUsages(Number(params.id)));
  });
}
```

- [ ] **Step 7 : Commit**

```bash
git add -A && git commit -m "feat: update/archive matiere with integrity + usages endpoint"
```

---

### Task 7 : Historique de prix

**Files:**
- Create: `src/services/matierePrix.ts`, `src/lib/validation/prix.ts`, `src/app/api/matieres/[id]/prix/route.ts`
- Test: `test/matiere-prix.test.ts`

**Interfaces:**
- Produces:
  - `prixCreateSchema` → `{ date: string; prix: number }`
  - `addPrix(matiereId: number, input: { date: string; prix: number }): Promise<MatierePrix>` (404 si matière absente)
  - `listPrix(matiereId: number): Promise<MatierePrix[]>` (décroissant par date)
  - `currentPrix(matiereId: number): Promise<number | null>` (prix le plus récent)
  - Routes `GET`/`POST` sur `/api/matieres/[id]/prix`.

- [ ] **Step 1 : Écrire les tests (échouent d'abord)**

`test/matiere-prix.test.ts` :
```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { resetDb } from './db';
import { createMatiere } from '@/services/matiere';
import { addPrix, listPrix, currentPrix } from '@/services/matierePrix';

let id: number;
beforeEach(async () => {
  await resetDb();
  id = (await createMatiere({ nom: 'Sel', provenance: 'base', uniteAchat: 'kg' })).id;
});

describe('historique de prix', () => {
  it('ajoute des prix et renvoie le plus récent comme courant', async () => {
    await addPrix(id, { date: '2026-01-01', prix: 1.2 });
    await addPrix(id, { date: '2026-06-01', prix: 1.5 });
    expect(await currentPrix(id)).toBe(1.5);
    const hist = await listPrix(id);
    expect(hist.map((p) => p.prix)).toEqual([1.5, 1.2]);
  });

  it('currentPrix null si aucun prix', async () => {
    expect(await currentPrix(id)).toBeNull();
  });

  it('addPrix 404 si matière absente', async () => {
    await expect(addPrix(999999, { date: '2026-01-01', prix: 1 }))
      .rejects.toMatchObject({ code: 'not_found', status: 404 });
  });
});
```

- [ ] **Step 2 : Lancer — doit échouer**

Run: `npm test test/matiere-prix.test.ts`
Expected: FAIL.

- [ ] **Step 3 : Schéma Zod**

`src/lib/validation/prix.ts` :
```ts
import { z } from 'zod';
export const prixCreateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  prix: z.number().nonnegative(),
});
export type PrixCreateInput = z.infer<typeof prixCreateSchema>;
```

- [ ] **Step 4 : Service prix**

`src/services/matierePrix.ts` :
```ts
import { prisma } from '@/lib/prisma';
import { getMatiere } from './matiere';
import type { PrixCreateInput } from '@/lib/validation/prix';

export async function addPrix(matiereId: number, input: PrixCreateInput) {
  await getMatiere(matiereId); // 404 si absente
  return prisma.matierePrix.create({
    data: { matiereId, date: new Date(input.date), prix: input.prix },
  });
}

export async function listPrix(matiereId: number) {
  return prisma.matierePrix.findMany({ where: { matiereId }, orderBy: { date: 'desc' } });
}

export async function currentPrix(matiereId: number): Promise<number | null> {
  const last = await prisma.matierePrix.findFirst({ where: { matiereId }, orderBy: { date: 'desc' } });
  return last?.prix ?? null;
}
```

- [ ] **Step 5 : Lancer — doit passer**

Run: `npm test test/matiere-prix.test.ts`
Expected: PASS.

- [ ] **Step 6 : Routes prix**

`src/app/api/matieres/[id]/prix/route.ts` :
```ts
import { requireApiKey, ok, created, handle } from '@/lib/api';
import { prixCreateSchema } from '@/lib/validation/prix';
import { addPrix, listPrix } from '@/services/matierePrix';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    return ok(await listPrix(Number(params.id)));
  });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    requireApiKey(req);
    const body = prixCreateSchema.parse(await req.json());
    return created(await addPrix(Number(params.id), body));
  });
}
```

- [ ] **Step 7 : Commit**

```bash
git add -A && git commit -m "feat: matiere price history (add/list/current)"
```

---

### Task 8 : Scaffold des webhooks + émission sur événements Matière

**Files:**
- Create: `src/lib/webhooks.ts`, `test/webhooks.test.json`, `webhooks.config.json`
- Modify: `src/services/matiere.ts`, `src/services/matierePrix.ts`
- Test: `test/webhooks.test.ts`, `test/matiere-webhook.test.ts`

**Interfaces:**
- Produces:
  - `resolveHooks(config: Record<string, string[]>, event: string): string[]` (pur).
  - `emit(event: string, data: unknown): Promise<void>` — lit le JSON `WEBHOOKS_CONFIG_PATH`, POST le payload `{ version: 1, type: event, data }` à chaque URL (best-effort, erreurs loguées, jamais propagées).
  - `createMatiere`/`addPrix` appellent `emit('matiere.creee'|'matiere.prix_ajoute', …)`.

- [ ] **Step 1 : Écrire le test de la fonction pure (échoue d'abord)**

`test/webhooks.test.ts` :
```ts
import { describe, it, expect } from 'vitest';
import { resolveHooks } from '@/lib/webhooks';

describe('resolveHooks', () => {
  it('renvoie les urls d’un événement', () => {
    const cfg = { 'matiere.creee': ['https://a', 'https://b'] };
    expect(resolveHooks(cfg, 'matiere.creee')).toEqual(['https://a', 'https://b']);
  });
  it('renvoie [] pour un événement inconnu', () => {
    expect(resolveHooks({}, 'x.y')).toEqual([]);
  });
});
```

- [ ] **Step 2 : Lancer — doit échouer**

Run: `npm test test/webhooks.test.ts`
Expected: FAIL.

- [ ] **Step 3 : Implémenter `webhooks.ts`**

```ts
import { readFile } from 'node:fs/promises';

export function resolveHooks(config: Record<string, string[]>, event: string): string[] {
  return config[event] ?? [];
}

async function loadConfig(): Promise<Record<string, string[]>> {
  const path = process.env.WEBHOOKS_CONFIG_PATH;
  if (!path) return {};
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch {
    return {};
  }
}

export async function emit(event: string, data: unknown): Promise<void> {
  const urls = resolveHooks(await loadConfig(), event);
  await Promise.all(
    urls.map((url) =>
      fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ version: 1, type: event, data }),
      }).catch((e) => console.error(`[webhook ${event} → ${url}]`, e)),
    ),
  );
}
```

- [ ] **Step 4 : Lancer — doit passer**

Run: `npm test test/webhooks.test.ts`
Expected: PASS.

- [ ] **Step 5 : Câbler l'émission (test avec espion, échoue d'abord)**

`test/matiere-webhook.test.ts` :
```ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { resetDb } from './db';
import * as webhooks from '@/lib/webhooks';
import { createMatiere } from '@/services/matiere';

beforeEach(resetDb);

describe('émission de webhook', () => {
  it('émet matiere.creee à la création', async () => {
    const spy = vi.spyOn(webhooks, 'emit').mockResolvedValue();
    await createMatiere({ nom: 'Sel', provenance: 'base', uniteAchat: 'kg' });
    expect(spy).toHaveBeenCalledWith('matiere.creee', expect.objectContaining({ nom: 'Sel' }));
    spy.mockRestore();
  });
});
```

- [ ] **Step 6 : Lancer — doit échouer**

Run: `npm test test/matiere-webhook.test.ts`
Expected: FAIL (emit non appelé).

- [ ] **Step 7 : Émettre depuis les services**

Dans `src/services/matiere.ts`, importer `import { emit } from '@/lib/webhooks';` et, à la fin de `createMatiere`, remplacer le `return` par :
```ts
  const m = await prisma.matiere.create({ data: input });
  await emit('matiere.creee', m);
  return m;
```
Dans `src/services/matierePrix.ts`, à la fin de `addPrix` :
```ts
  const p = await prisma.matierePrix.create({ data: { matiereId, date: new Date(input.date), prix: input.prix } });
  await emit('matiere.prix_ajoute', { matiereId, date: input.date, prix: input.prix });
  return p;
```
(importer `emit` en tête de `matierePrix.ts`).

- [ ] **Step 8 : Lancer toute la suite — doit passer**

Run: `npm test`
Expected: PASS (toutes les suites).

- [ ] **Step 9 : Commit**

```bash
git add -A && git commit -m "feat: webhook scaffold + emit on matiere create/price"
```

---

## Definition of Done (Plan 1)

- `npm test` vert (8 tâches, toutes les suites).
- API Matières fonctionnelle : `POST/GET/PUT/DELETE /api/matieres`, `/[id]`, `/[id]/prix`, `/[id]/usages`.
- Schéma Prisma du **Catalogue complet** en place (prêt pour les plans suivants).
- Intégrité (noms uniques, refus d'archivage si référencée), auth par clé d'API, webhooks émis sur création/prix.

## Plans suivants (Catalogue)

- **Plan 2** — Recettes : ingrédients (unités/proportions), étapes + équipements + paramètres, **coût matière** (2 modes) + `cout_partiel`, temps de travail.
- **Plan 3** — Conditionnements + Produits finis : **prix de revient** (matière + conditionnement + MO) et **marge** ; recette « simple » (revente brute).
- **Plan 4** — Écrans back-office (Next.js UI) des 5 entités.
- **Plan 5** — Auth multi-utilisateur (login/mdp, opérateur tracé) + doc API/webhooks versionnée.

## Liens

- [[A - Catalogue (spec)]] · [[00 - Cas d'utilisation]] · [[10 - Décisions & questions ouvertes]] · [[Guide technique pour développeurs]]
