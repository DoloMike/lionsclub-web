# webapp-template

Starter for **Next.js + TypeScript + Tailwind + Supabase + Bun + Docker**, aligned with patterns used in larger App Router apps (env module, split Supabase clients, `robots` / `sitemap`, health check, Vitest).

## Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **Supabase** (browser anon client + server-only service role client)
- **Vitest** (API / config tests)
- **Docker + Nginx** (production-style deploy)
- **Bun** (package manager)

## Quick start

```bash
bun install
cp .env.example .env
# Edit .env — at minimum set Supabase URL, anon key, and service role key.
bun run dev
```

## Environment variables

| Variable | Where | Purpose |
|----------|--------|---------|
| `NEXT_PUBLIC_APP_URL` | Client + server | Canonical site URL (`metadataBase`, `sitemap.xml`) |
| `NEXT_PUBLIC_NOINDEX` | Build / runtime | When `true`, staging-style: meta robots, `X-Robots-Tag`, and `robots.txt` disallow |
| `NEXT_PUBLIC_SUPABASE_URL` | Client + server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + server | Public anon key (RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** | Service role — never expose to the browser; used by `@/lib/supabase/server` |

See `.env.example` for a filled-out template.

## Supabase clients

- **Browser / Client Components:** `import { supabase } from "@/lib/supabase/browser"`
- **Server Components, Route Handlers, Server Actions:** `import { supabaseAdmin } from "@/lib/supabase/server"`  
  The server module uses `import "server-only"` so it cannot be bundled into client code.

Use RLS policies for user-facing data; reserve the service role for trusted server-side work (admin queries, webhooks, migrations scripts, etc.).

## Useful routes

- **`GET /api/health`** — JSON `{ "status": "ok" }` for load balancers and Docker `healthcheck` (see `docker/docker-compose.yml`).

## Commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Dev server |
| `bun run build` | Production build |
| `bun run start` | Start production server |
| `bun run lint` | ESLint |
| `bun run type-check` | `tsc --noEmit` |
| `bun run test` | Vitest (once) |
| `bun run test:watch` | Vitest watch mode |

## Deploy with Docker

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
  app/           # App Router pages, layouts, error boundary, robots, sitemap
  components/    # Shared UI (Header, Footer, …)
  lib/           # env.ts, supabase/browser.ts, supabase/server.ts
```

When you outgrow a single repo, add a `supabase/` directory for migrations and CLI scripts the same way as production Supabase projects.
