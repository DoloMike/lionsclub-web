# Production Deployment Checklist — lionsclub-web

**Last updated:** April 2026  
**Status:** ❌ Blocked — several prerequisites unmet before first deploy

---

## What we've learned so far

### This server (the production host)

- **Tailscale IP:** `100.92.149.45`
- **Nginx:** BROKEN — `systemctl status nginx` shows failed unit. Trying to load SSL cert
  `/etc/letsencrypt/live/staging.deploys.internetmusicindex.com/fullchain.pem` which **does not exist**
  (directory is empty/missing). This blocks nginx restart.
- **Coolify:** Running at `100.92.149.45:8889` — only 1 app deployed: `internetmusicindex-staging`
  (Coolify UUID: `wijikcto6ef435pmxuqzb0ou`, fqdn: `http://wijikcto6ef435pmxuqzb0ou.178.156.249.242.sslip.io`)
- **Supabase (internetmusicindex):** Running as Docker containers, ports 54321–54327
  (54321 = Kong/api, 54322 = db, 54323 = Studio, 54324 = SMTP, 54325 = IMAP, 54326 = POP3, 54327 = analytics)
- **Coolify DB:** Separate Postgres at port 5432 (not the same as Supabase db)

### CI/CD pipeline

**`.github/workflows/ci.yml`** — runs on every push to main and on PRs:
`bun install → bun run lint → bun run test → bun run build → bun run type-check`
All env vars are placeholders (ci-placeholder). CI has been failing — **actual failure output not yet retrieved.**

**`.github/workflows/deploy.yml`** — runs on push to main, after CI passes:
1. Connects via Tailscale
2. Cancels any in-progress Coolify deployments + waits for idle
3. Triggers Coolify deploy via `POST /api/v1/deploy?uuid=${APP_UUID}&force=false`
4. Polls deployment status until finished/failed/error

**Required GitHub Secrets (not yet set):**
- `COOLIFY_HOST` — Coolify host URL
- `COOLIFY_APPLICATION_UUID` — the lionsclub-web application UUID in Coolify
- `COOLIFY_TOKEN` — Coolify API token
- `TAILSCALE_OAUTH_CLIENT_ID` — Tailscale OAuth client ID
- `TAILSCALE_OAUTH_CLIENT_SECRET` — Tailscale OAuth client secret

---

## Deployment blockers (in order)

### 1. ❌ Fix nginx (server-wide, affects everything)

**Problem:** nginx won't start because it can't load
`/etc/letsencrypt/live/staging.deploys.internetmusicindex.com/fullchain.pem` (file missing).

**Why it matters:** nginx fronts both Coolify (port 8443/8080) and the internetmusicindex staging site.
Can't restart services until nginx is fixed.

**Fix:** Check what's actually in `/etc/letsencrypt/archive/` and either restore the cert or
remove the broken `server` block from `/etc/nginx/sites-enabled/coolify` (the ssl cert directives
in that file reference a cert that doesn't exist). Then `nginx -t && systemctl restart nginx`.

---

### 2. ❌ Create a new Supabase instance for lionsclub-web

**Problem:** The existing Supabase is for `internetmusicindex`. lionsclub-web needs its own
Supabase project to avoid schema conflicts and keep its data isolated.

**What we know:**
- Supabase runs as Docker containers; each "project" is a separate set of containers
- The existing Supabase uses ports 54321–54327. A new instance needs **different mapped host ports**
- Supabase's Docker compose defines: db, kong, auth, storage, rest, realtime, pg_meta, studio, inbucket, analytics, vector

**Options:**
- **Option A:** Add a second Supabase instance via Docker Compose (recommended if server resources allow)
  - Use different port range (e.g., 54330–54340)
  - Needs new `docker-compose.yml` or add to existing
- **Option B:** Use Supabase hosted (cloud) — create a project at supabase.com and use that
  - Simpler ops, but data lives off-server

**Task:** Determine which option; configure new Supabase; run migrations from `supabase/migrations/`

---

### 3. ❌ Add lionsclub-web app to Coolify

**Problem:** Coolify only has the `internetmusicindex-staging` app. No app exists for lionsclub-web.

**Task:** In Coolify UI (`https://staging.deploys.internetmusicindex.com` or directly at Coolify), add:
- New application: `lionsclub-web`
- Git source: `https://github.com/DoloMike/lionsclub-web`
- Branch: `main`
- Build pack: Docker (or custom Dockerfile — repo has `docker/Dockerfile`)
- Environment variables (from `.env.example` + production values)
- Port: Next.js default 3000, exposed as container port

**After creation:** Set GitHub Actions secret `COOLIFY_APPLICATION_UUID` to the new app's UUID.

---

### 4. ❌ Set GitHub Actions secrets

**Problem:** The `deploy.yml` workflow requires 5 secrets that don't exist in the repo.

**Tasks:**
- `COOLIFY_HOST` — `https://staging.deploys.internetmusicindex.com` or internal `http://100.92.149.45:8889`
- `COOLIFY_APPLICATION_UUID` — UUID from step 3
- `COOLIFY_TOKEN` — Coolify API token (check Coolify instance settings UI)
- `TAILSCALE_OAUTH_CLIENT_ID` — from Tailscale admin console
- `TAILSCALE_OAUTH_CLIENT_SECRET` — from Tailscale admin console

---

### 5. ❌ Nginx — add lionsclub-web site (prevent conflict)

**Problem:** Need to ensure the lionsclub-web app is reachable via nginx (or Coolify's built-in proxy)
without conflicting with the existing `internetmusicindex` nginx config.

**Tasks:**
- If Coolify handles routing automatically (via its internal nginx/proxy): just configure the right
  `NEXT_PUBLIC_APP_URL` env var and verify routing
- If a separate nginx `server` block is needed: add one for the lionsclub domain/subdomain
  pointing to the Coolify-assigned container port
- **Important:** The existing nginx config for `staging.internetmusicindex.com` proxies to
  `127.0.0.1:3001`. Ensure lionsclub-web gets a different port

---

### 6. ❌ Get CI green first

**Problem:** CI (lint + test + build + type-check) is failing. Need to know the actual error.

**Task:** Get CI failure output from GitHub Actions UI or via API, then fix whatever is breaking.
Likely culprits: missing env vars, lint errors, failing tests, or TypeScript errors.

---

### 7. ❌ Env vars for production

**Problem:** `.env.example` has many vars. Need production values for:
- `NEXT_PUBLIC_APP_URL` — canonical production URL
- `NEXT_PUBLIC_SUPABASE_URL` — new lionsclub Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — new Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — new Supabase service role key
- `STRIPE_SECRET_KEY` — `sk_live_…` (Stripe live key)
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — production Google OAuth client
- `NEXT_PUBLIC_NOINDEX=false` — production flag
- `NEXT_PUBLIC_SITE_TIMEZONE` — `America/Kentucky/Louisville` (Lewisport, KY)

---

## Auto-deploy on push to main

Once all blockers above are resolved:
- Push to `main` → CI runs (lint/test/build/type-check) → if green, deploy.yml triggers → Coolify deploys
- No manual steps needed after first setup

---

## Current server port map (occupied)

| Port | Service |
|------|---------|
| 80/443 | nginx (currently failed) |
| 5432 | Coolify DB |
| 54321 | Supabase (imi) API/Kong |
| 54322 | Supabase (imi) DB |
| 54323 | Supabase (imi) Studio |
| 54324 | Supabase (imi) SMTP |
| 54325 | Supabase (imi) IMAP |
| 54326 | Supabase (imi) POP3 |
| 54327 | Supabase (imi) Analytics |
| 8000 | ? (check `ss -tlnp`) |
| 8080 | Coolify HTTP |
| 8443 | Coolify HTTPS |
| 8889 | Coolify (main) |
| 9000 | Coolify? |
| 3001 | internetmusicindex-staging (container port → host 3001) |
| 100.92.149.45:6001-6002 | Coolify realtime |

---

## Questions / decisions needed

1. **Supabase approach:** Docker-hosted on this server (new port range) or Supabase Cloud?
2. **Domain / subdomain:** What URL should lionsclub-web be accessible at? (e.g. `lionsclub.internetmusicindex.com` or a separate domain?)
3. **nginx fix first:** Who should handle the broken nginx SSL cert — just remove the broken coolify site config, or do you want to preserve it?
4. **CI failure:** Do you have the GitHub Actions run URL with the CI failure output, or should I pull it via the API?
5. **Stripe:** Is there a live Stripe account to use, or should we start with test keys?
