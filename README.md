# CanoJoel Champions

## Credencials de prova

| Rol | Email | Contrasenya |
|-----|-------|-------------|
| `ADMIN` | `admin@admin.com` | `admin123` |
| `EDITOR` | `editor@editor.com` | `editor123` |

> Per crear usuaris `EDITOR` o `USER` addicionals: registra'ls a `/auth/register` i canvia'ls el rol des de `/admin/usuaris`.

Plataforma SaaS multi-usuari per seguir la **UEFA Champions League**: equips, partits, classificació automàtica i gestió de continguts via backoffice amb control d'accés basat en rols (`USER`, `EDITOR`, `ADMIN`). Projecte final del mòdul **M0613 IA7** (DAW2, sessions S16–S20).

**Demo en producció:** https://joelcs-champions.vercel.app/  
**Repositori:** https://github.com/JoelitoCS/canojoel_champions

---

## Funcionalitats

### Públiques (sense sessió)
- Llistat d'equips participants amb escuts, país i grup.
- Partits de totes les fases amb marcadors i estat.
- Taula de classificació calculada automàticament.

### Usuaris autenticats (`USER`)
- Registre i inici de sessió amb credencials.
- Perfil editable: nom, email i foto d'avatar (pujada a Supabase Storage).

### Rol `EDITOR`
- CRUD complet d'**equips** (crear, editar, eliminar).
- CRUD complet de **partits** (crear, editar resultats, eliminar).
- Accés al panel `/editor`.

### Rol `ADMIN`
- Tot el que pot fer l'EDITOR.
- **Gestió d'usuaris**: llistar, canviar rol (`USER` / `EDITOR` / `ADMIN`) i eliminar comptes.
- Accés al panel `/admin` amb estadístiques globals.

---

## Stack tècnic

| Capa | Tecnologia |
|------|-----------|
| Framework | **Next.js 16** (App Router), **React 19**, **TypeScript** |
| ORM / BD | **Prisma** → **PostgreSQL** (hostatjat a **Supabase**) |
| Auth | **Auth.js v5** (NextAuth) — JWT + Credentials provider |
| Validació | **Zod** |
| UI | **Tailwind CSS v4**, CSS custom (tema Champions) |
| Media | **Supabase Storage** (avatars) |
| Deploy | **Vercel** (app) + **Supabase** (DB + Storage) |

---

## Arquitectura

```
Browser → Next.js App Router (RSC + Route Handlers)
                → Prisma → Supabase PostgreSQL
                → Auth.js JWT (proxy.ts per protegir rutes)
                → Supabase Storage (pujada d'avatars, server-side)
```

**Rutes protegides per `proxy.ts`** (equivalent a `middleware.ts` — nom requerit per conflicte):

| Ruta | Rol mínim |
|------|-----------|
| `/perfil` | `USER` |
| `/editor/*` | `EDITOR` o `ADMIN` |
| `/admin/*` | `ADMIN` |

---

## Models de dades (Prisma)

```
User     id · name · email · password (bcryptjs) · role · image
Team     id · name · shortName · logo · country · group
Match    id · homeTeamId · awayTeamId · homeScore · awayScore · matchDate · stage · status · venue

enum Role         { USER · EDITOR · ADMIN }
enum MatchStage   { GROUP · ROUND_OF_16 · QUARTER_FINAL · SEMI_FINAL · FINAL }
enum MatchStatus  { SCHEDULED · LIVE · FINISHED · CANCELLED }
```

---

## API REST

| Mètode | Ruta | Accés | Descripció |
|--------|------|-------|-----------|
| GET | `/api/teams` | Públic | Llista equips |
| POST | `/api/teams` | EDITOR+ | Crea equip |
| PUT | `/api/teams/[id]` | EDITOR+ | Actualitza equip |
| DELETE | `/api/teams/[id]` | EDITOR+ | Elimina equip |
| GET | `/api/matches` | Públic | Llista partits |
| POST | `/api/matches` | EDITOR+ | Crea partit |
| PUT | `/api/matches/[id]` | EDITOR+ | Actualitza partit |
| DELETE | `/api/matches/[id]` | EDITOR+ | Elimina partit |
| POST | `/api/register` | Públic | Registra usuari (rol USER) |
| GET | `/api/profile` | Autenticat | Obté dades pròpies |
| PATCH | `/api/profile` | Autenticat | Actualitza nom/email |
| POST | `/api/profile/avatar` | Autenticat | Puja foto de perfil |
| GET | `/api/users` | ADMIN | Llista tots els usuaris |
| PATCH | `/api/users/[id]` | ADMIN | Canvia rol d'usuari |
| DELETE | `/api/users/[id]` | ADMIN | Elimina usuari |

---

## Requisits previs

- **Node.js** LTS (v20+)
- Compte i projecte a **Supabase** (PostgreSQL + Storage)
- **Git**

---

## Posada en marxa

### 1. Clonar i instal·lar

```bash
git clone https://github.com/JoelitoCS/canojoel_champions.git
cd canojoel_champions
npm install
```

### 2. Variables d'entorn

```bash
cp .env.example .env
```

Edita `.env` amb els teus valors (veure taula de variables). Mai pujar `.env` al repositori.

### 3. Base de dades

```bash
npx prisma migrate dev      # Aplica migracions i genera el client
npm run db:seed             # Omple els 32 equips de la Champions 2023/24
npm run db:seed-matches     # Omple els 48 partits de fase de grups
```

### 4. Executar en local

```bash
npm run dev
```

Obrir [http://localhost:3000](http://localhost:3000)

**Usuaris per defecte:** `admin@admin.com` / `admin123` i `editor@editor.com` / `editor123`

---

## Variables d'entorn

| Variable | Descripció |
|----------|-----------|
| `DATABASE_URL` | URL **pooled** de Supabase (Prisma client) |
| `DIRECT_URL` | URL **directa** de Supabase (migracions) |
| `AUTH_SECRET` | Secret fort per a Auth.js (mínim 32 caràcters) |
| `NEXTAUTH_URL` | URL de l'app (`http://localhost:3000` en dev) |
| `NEXT_PUBLIC_SUPABASE_URL` | URL pública del projecte Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clau de servei Supabase (només servidor) |
| `SUPABASE_BUCKET_AVATARS` | Nom del bucket per a avatars d'usuari |

---

## Scripts disponibles

| Comanda | Acció |
|---------|-------|
| `npm run dev` | Servidor de desenvolupament |
| `npm run build` | Build de producció (inclou `prisma generate`) |
| `npm run start` | Servidor de producció |
| `npm run lint` | ESLint |
| `npm run db:seed` | Seed dels 32 equips |
| `npm run db:seed-matches` | Seed dels partits |
| `npm run db:studio` | Prisma Studio (explorador visual de la BD) |

---

## Desplegament a Vercel

1. Pujar el codi a GitHub i connectar el repositori a **Vercel**.
2. Configurar totes les variables d'entorn de producció al dashboard de Vercel.
3. Aplicar migracions a la BD de producció:
   ```bash
   npx prisma migrate deploy
   ```
4. El `build` de Vercel executa `prisma generate && next build` automàticament.

---

## Notes tècniques importants

- **`proxy.ts` en lloc de `middleware.ts`**: Next.js 16 requereix el nom `proxy` per evitar conflictes; l'export ha de ser `proxy`, no `middleware`.
- **Cookie de sessió Auth.js v5**: `authjs.session-token` en dev, `__Secure-authjs.session-token` en producció. S'especifica explícitament a `getToken()`.
- **Logos d'equips**: es carreguen des de CDN extern (`media.api-sports.io`) via `<img>` natiu (no `next/image`) per evitar bloquejos de CSP. Si fallen, el component `TeamShield` mostra les inicials com a fallback.
- **Seeds**: `tsx` llegeix `.env`, no `.env.local`. Assegurar-se que `.env` té les credencials reals abans d'executar seeds.

---

## Llista de verificació IA7

- [x] Visitant pot consultar equips i partits amb dades reals de la BD.
- [x] Usuari pot registrar-se i iniciar sessió.
- [x] Rol `EDITOR` pot fer CRUD d'equips i partits.
- [x] Rol `ADMIN` pot fer CRUD d'equips, partits i gestionar usuaris (canvi de rol, eliminació).
- [x] Perfil editable amb foto d'avatar pujada a Supabase Storage.
- [x] App desplegada a Vercel amb variables d'entorn configurades.

---

## Autor

**Joel Cano** — DAW2 · M0613 IA7
