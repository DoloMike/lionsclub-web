# lionsclub-web

Lions Club web app — **Next.js + TypeScript + Tailwind + Supabase + Bun + Docker**, bootstrapped from [webapp-template](https://github.com/dolomikeclaw/webapp-template) (env module, split Supabase clients, `robots` / `sitemap`, health check, Vitest).

## Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **Supabase** (`@supabase/ssr` + `@supabase/supabase-js` — browser client, cookie session refresh in `middleware.ts`, anon on server where needed, service role for trusted writes)
- **Stripe** (optional — chicken cook checkout when `STRIPE_SECRET_KEY` is set)
- **Vitest** (API / config / utility tests)
- **Docker + Nginx** (production-style deploy)
- **Bun** (package manager)

## Documentation

- **[docs/status-and-next.md](docs/status-and-next.md)** — **start here:** concise **what’s done** vs **what’s next** (including production deploy).
- **[docs/lewisport-lions-site-plan.md](docs/lewisport-lions-site-plan.md)** — full product vision, IA, phased plan, and detailed background.
- **[docs/ux-review.md](docs/ux-review.md)** — structured UX/UI review (historical baseline; see note at top).

## Quick start

```bash
bun install
cp .env.example .env.local
# Edit `.env.local` — at minimum set Supabase URL, anon key, and service role key (see below).
bun run dev
```

### HTTPS (local dev)

**`bun run dev`** serves the dev app over **HTTPS** (`next dev --experimental-https`). The first run may download tooling, generate a local CA, and create a **`certificates/`** directory (kept out of git—Next adds it to `.gitignore`). On some systems you may be prompted for permission to install or trust the dev CA.

Use **`bun run dev:http`** only if you need plain HTTP (for example debugging TLS issues).

Then open the **https://** URL printed in the terminal (default **https://localhost:3000**; if that port is busy, Next picks another—match your env to the printed port).

Set **`NEXT_PUBLIC_APP_URL`** in **`.env.local`** to the same origin (for example `https://localhost:3000`) while using HTTPS so `metadataBase`, `sitemap.xml`, and any absolute URLs stay consistent.

**Custom key/cert:** to use your own files (for example from [mkcert](https://github.com/FiloSottile/mkcert)) instead of the generated ones:

```bash
next dev --experimental-https --experimental-https-key ./path/to/localhost-key.pem --experimental-https-cert ./path/to/localhost.pem
```

Local key/cert files should stay out of git; this repo already ignores `*.pem` and the generated **`certificates/`** entry.

## Environment variables

| Variable | Where | Purpose |
|----------|--------|---------|
| `NEXT_PUBLIC_APP_URL` | Client + server | Canonical site URL (`metadataBase`, `sitemap.xml`) |
| `NEXT_PUBLIC_NOINDEX` | Build / runtime | When `true`, staging-style: meta robots, `X-Robots-Tag`, and `robots.txt` disallow |
| `NEXT_PUBLIC_SUPABASE_URL` | Client + server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + server | Public anon key (RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** | Service role — never expose to the browser; used by `@/lib/supabase/admin` |
| `STRIPE_SECRET_KEY` | **Server only** | Stripe secret — chicken checkout on `/fundraising/order` is disabled until this is set |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Client | Google OAuth / One Tap (optional; see `HeaderAuthControls` and Supabase Auth) |
| `NEXT_PUBLIC_SITE_TIMEZONE` | Client + server | IANA timezone for fundraiser deadlines vs “today” (defaults to `America/Kentucky/Louisville`) |

See **`.env.example`** for a template; copy it to **`.env.local`** for local secrets (gitignored).

## Supabase clients

- **Browser / Client Components:** `import { createBrowserSupabaseClient } from "@/lib/supabase/browser"`
- **Server (session + user context):** `@/lib/supabase/server-client` (cookie-based session via `@supabase/ssr`)
- **Server (public reads, no user):** `@/lib/supabase/public-server` (anon key, `server-only`)
- **Trusted server-only writes / admin:** `import { getSupabaseAdmin } from "@/lib/supabase/admin"` (service role)  
  The admin module uses `import "server-only"` so it cannot be bundled into client code.

`src/middleware.ts` refreshes the Supabase auth cookie on each matched request (see Next.js notes if migrating from `middleware` to `proxy` in a future release).

Use RLS policies for user-facing data; reserve the service role for trusted server-side work (admin queries, Stripe webhooks, migrations, etc.).

## Database & site admin

### Local Supabase (CLI)

If another project already uses the default Supabase ports (`54321`–`54329`), this repo’s `supabase/config.toml` uses **`55421`** for the API (and matching `55422` DB, **`55423`** Studio, etc.) so both stacks can run.

```bash
supabase start
supabase status -o env
```

Copy **API_URL**, **ANON_KEY**, and **SERVICE_ROLE_KEY** into **`.env.local`** as `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`. Migrations under `supabase/migrations/` apply on `supabase start` (or run new SQL files in the dashboard if you add them after the DB already exists).

### Google sign-in (OAuth)

1. **Supabase:** Authentication → **Providers** → **Google** → enable and paste **Client ID** and **Client secret** from [Google Cloud Console](https://console.cloud.google.com/apis/credentials) (OAuth 2.0 Web client).
2. **Google Cloud:** Authorized **redirect URI** must include your Supabase Auth callback, e.g. `http://127.0.0.1:55421/auth/v1/callback` for this repo’s local API port, or `https://<project-ref>.supabase.co/auth/v1/callback` for hosted projects. (Use the **API URL** from `supabase status` without a trailing slash.)
3. **Supabase URL configuration:** Authentication → **URL configuration** → add redirect URLs **`http://localhost:3000/auth/callback`** and, if you use local HTTPS, **`https://localhost:3000/auth/callback`** (plus production URLs when you deploy).
4. Sign in at **`/admin/login`** with **Continue with Google**. New users get the default **`guest`** profile (`profiles.role`); promote to **member** or **admin** in Supabase as needed (SQL below for admin).

### Cloud or self-hosted (dashboard SQL)

1. In the Supabase dashboard, open **SQL** and run the migrations in `supabase/migrations/` in order, notably:
   - `20260418120000_chapter_content.sql` — `site_settings`, `officers`, `chapter_events`, `profiles`
   - `20260418140000_social_links.sql` — editable footer **social links**
   - `20260418150000_chicken_orders.sql` — **fundraiser events** and **chicken orders** (Stripe checkout)
2. Under **Authentication → Providers**, enable **Email** (or your preferred method) so users can sign in.
3. Create the first user (Authentication → Users → Add user, or sign up from your app if sign-ups are enabled).
4. Promote that user to admin (SQL):

   ```sql
   update public.profiles set role = 'admin' where id = '<paste auth user uuid>';
   ```

5. Open **`/admin/login`**, sign in, and use **Meeting schedule**, **Social links**, **Officers**, **Events**, and **Fundraisers** to edit public content and open/configure chicken cook events.

Public pages read meeting text, social links, officers, and events from Supabase when configured. Chapter name, venue (NAP), default contact email, and static fallbacks live in **`src/lib/site.ts`** — adjust before launch. **Organization JSON-LD** (schema.org `NGO`) is emitted from `src/components/JsonLd.tsx` in the root layout for local SEO.

## Useful routes

- **`GET /api/health`** — JSON `{ "status": "ok" }` for load balancers and Docker `healthcheck` (see `docker/docker-compose.yml`).
- **`/fundraising`** — fundraiser overview; **`/fundraising/order`** — chicken cook checkout (guest, Stripe; requires `STRIPE_SECRET_KEY` + an **open** event from **Admin → Fundraisers**).
- **`/admin/fundraiser/[eventId]/stats`** — per-event order totals and table (admins only).
- **`GET /api/admin/fundraiser/[eventId]/orders-csv`** — download all orders for an event as CSV (admins only; same session cookie as admin UI).
- **`/admin/login`** — Google sign-in for chapter admins; **`/auth/callback`** — Supabase OAuth callback (do not remove).

## Commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Dev server (**HTTPS**, self-signed cert) |
| `bun run dev:http` | Dev server (HTTP only) |
| `bun run build` | Production build |
| `bun run start` | Start production server |
| `bun run lint` | ESLint |
| `bun run type-check` | `tsc --noEmit` |
| `bun run test` | Vitest (once) |
| `bun run test:watch` | Vitest watch mode |

## Deploy with Docker

Ensure **`.env.local`** exists (same variables as local dev); `docker/docker-compose.yml` loads it for the app container.

```bash
docker compose -f docker/docker-compose.yml up -d
```

Nginx proxies port **80** → Next.js on **3000** inside the stack. The `app` service includes a health check against `/api/health`.

## Deploy with GitHub Actions

### Required secrets

Set these in **Settings → Secrets and variables → Actions**:

| Secret | Description |
|--------|-------------|
| `COOLIFY_HOST` | Coolify host, e.g. `100.92.149.45:8889` |
| `COOLIFY_APPLICATION_UUID` | UUID of your Coolify application |
| `COOLIFY_TOKEN` | Coolify API token |
| `TAILSCALE_OAUTH_CLIENT_ID` | Tailscale OAuth client ID |
| `TAILSCALE_OAUTH_CLIENT_SECRET` | Tailscale OAuth client secret |

### Workflows

- **`ci.yml`** — On push / PR: lint, tests, type-check, build
- **`deploy.yml`** — On push to `main`: Tailscale → Coolify deploy

### Tailscale setup

1. Create an OAuth client in [Tailscale admin](https://login.tailscale.com/admin/settings/oauth).
2. Add the `tag:ci` tag to your device.
3. Store the client ID and secret as GitHub Actions secrets.

## Project layout (high level)

```text
src/
  app/              # App Router: public pages, /admin/*, /auth/callback, /fundraising/order/*
  components/       # Shared UI (Header, Footer, Landing, admin/*, LionsLogo, SocialIcon, ExternalLink, …)
  lib/              # env.ts, site.ts, supabase/*, auth/*, data/*, leaves-site.ts, …
  middleware.ts     # Supabase session cookie refresh (see Next.js `middleware` / `proxy` docs)
docs/
  status-and-next.md             # Concise shipped vs next (incl. prod deploy)
  lewisport-lions-site-plan.md   # Full product spec, IA, phased plan
supabase/
  config.toml       # Local CLI ports (API default 55421 to avoid clashing with 54321)
  migrations/       # SQL applied on `supabase start` / dashboard
```

Product direction and **what’s shipped vs next** are tracked in **`docs/status-and-next.md`** (full detail in **`docs/lewisport-lions-site-plan.md`**).
