# Production Deployment TODO — lewisportlions.club

**Last updated:** April 18, 2026
**CI Status:** ✅ GREEN (next-themes + bun.lock fixed)
**Deploy Status:** ❌ BLOCKED — multiple prerequisites unmet

---

## Current Status

| Item | Status |
|------|--------|
| CI (lint → test → build → type-check) | ✅ Passing |
| Deploy to Coolify | ❌ Tailscale OAuth secrets missing |
| Supabase for lionsclub-web | ❌ Not created |
| Coolify app for lionsclub-web | ❌ Not created |
| nginx / SSL for lionsclub.club | ❌ Not configured |
| GitHub Actions secrets | ❌ 4 of 5 missing |

---

## TODO (in order)

### 1. 🔲 Set GitHub Actions secrets

The `deploy.yml` workflow requires these secrets in the repo:

| Secret | Where to get it |
|--------|-----------------|
| `COOLIFY_HOST` | `https://staging.deploys.internetmusicindex.com` or `http://100.92.149.45:8889` |
| `COOLIFY_APPLICATION_UUID` | Create app in Coolify first (see TODO 3) |
| `COOLIFY_TOKEN` | Coolify dashboard → Settings → API Tokens |
| `TAILSCALE_OAUTH_CLIENT_ID` | tailscale.com/admin/settings/oauth-clients |
| `TAILSCALE_OAUTH_CLIENT_SECRET` | tailscale.com/admin/settings/oauth-clients |

**Action:** After creating the Coolify app (TODO 3), set all 5 secrets via:
```bash
gh secret set COOLIFY_HOST --body "https://staging.deploys.internetmusicindex.com"
gh secret set COOLIFY_APPLICATION_UUID --body "<UUID from Coolify>"
gh secret set COOLIFY_TOKEN --body "<token from Coolify>"
gh secret set TAILSCALE_OAUTH_CLIENT_ID --body "<from Tailscale admin>"
gh secret set TAILSCALE_OAUTH_CLIENT_SECRET --body "<from Tailscale admin>"
```

---

### 2. 🔲 Fix broken nginx on server

**Problem:** nginx is failed because it references a missing SSL cert:
`/etc/letsencrypt/live/staging.deploys.internetmusicindex.com/fullchain.pem`

**Impact:** Blocks nginx restart, which affects Coolify proxy and the existing internetmusicindex site.

**Fix (on server):**
```bash
# Check what's in the coolify nginx site config
cat /etc/nginx/sites-enabled/coolify

# Either restore the cert or remove the broken ssl_certificate directives
# Then test and restart:
nginx -t && systemctl restart nginx
```

⚠️ **Important:** Whatever fix is applied must not break the existing `internetmusicindex` routing.

---

### 3. 🔲 Create new Supabase instance for lionsclub-web

**Goal:** Isolated Supabase project for lionsclub-web, running as Docker containers on the same server.

**Existing Supabase (internetmusicindex) ports:** 54321–54327
**New instance should use:** ports 54330–54340 (avoids conflict)

**Steps:**
```bash
# Create new docker-compose.yml for lionsclub Supabase in ~/dev/lionsclub-web/supabase/
# or a separate location on the server

# Key config changes vs existing Supabase:
# - db port: 54322 → 54332
# - kong port: 54321 → 54331
# - studio port: 54323 → 54333
# - analytics port: 54327 → 54337
# - Use different POSTGRES_PASSWORD

# Start with restart: always so it survives reboots
docker compose up -d
```

**After instance is up, collect these values for GitHub Actions / Coolify env vars:**
- `NEXT_PUBLIC_SUPABASE_URL` = the new Kong URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

**Then run migrations:**
```bash
supabase db push  # or apply migrations from supabase/migrations/
```

---

### 4. 🔲 Create lionsclub-web app in Coolify

**Goal:** Add the app so Coolify can receive deploy triggers from GitHub Actions.

**Steps:**
1. Go to Coolify dashboard (`http://100.92.149.45:8889`)
2. Add new application: `lionsclub-web`
3. Git source: `https://github.com/DoloMike/lionsclub-web`
4. Branch: `main`
5. Build pack: Docker (repo has `docker/Dockerfile`)
6. Environment variables — copy from `.env.example`, fill in production values:
   - `NEXT_PUBLIC_SUPABASE_URL` = new lionsclub Supabase URL (from TODO 3)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = from TODO 3
   - `SUPABASE_SERVICE_ROLE_KEY` = from TODO 3
   - `NEXT_PUBLIC_APP_URL` = `https://lewisportlions.club` (or chosen domain)
   - `NEXT_PUBLIC_SITE_TIMEZONE` = `America/Kentucky/Louisville`
   - `NEXT_PUBLIC_NOINDEX` = `false` (production)
   - `STRIPE_SECRET_KEY` = `sk_live_...` (if live Stripe account exists)
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID` = production Google OAuth client
7. Expose port: container port 3000

**After creation:** Copy the app's UUID and set it as `COOLIFY_APPLICATION_UUID` secret (TODO 1).

---

### 5. 🔲 nginx — add lionsclub.club site / SSL cert

**Goal:** Route `lewisportlions.club` traffic to the Coolify-deployed container without conflicting with existing nginx config.

**Options:**
- **Option A (recommended):** Let Coolify handle routing via its built-in proxy — set `NEXT_PUBLIC_APP_URL` correctly and configure Coolify's public domain.
- **Option B:** Add nginx `server` block for `lewisportlions.club` pointing to the Coolify container port.

**For SSL (Option B or if Coolify uses nginx):**
```bash
# Using Cloudflare DNS challenge (same as existing certs):
certbot --nginx -d lewisportlions.club --dns-cloudflare
```

**Verify no conflicts** with existing nginx config for `internetmusicindex` before restarting.

---

### 6. 🔲 Env vars for production

From `.env.example`, these still need production values:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_APP_URL` | `https://lewisportlions.club` (confirm domain) |
| `NEXT_PUBLIC_SUPABASE_URL` | From TODO 3 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From TODO 3 |
| `SUPABASE_SERVICE_ROLE_KEY` | From TODO 3 |
| `STRIPE_SECRET_KEY` | Live Stripe key (`sk_live_…`) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Production Google OAuth client |
| `NEXT_PUBLIC_NOINDEX` | `false` |
| `NEXT_PUBLIC_SITE_TIMEZONE` | `America/Kentucky/Louisville` |

---

## Open Questions

1. **Domain:** Is `lewisportlions.club` the production URL, or a subdomain of `internetmusicindex.com`?
2. **Stripe:** Live keys or test keys for now?
3. **nginx fix:** Should the broken coolify SSL config be removed or restored?
4. **Supabase migrations:** Are there existing migration files in `supabase/migrations/` to apply?

---

## Server Info

**Tailscale IP:** `100.92.149.45`
**Coolify:** `100.92.149.45:8889`
**Existing Supabase (imi):** ports 54321–54327
**New Supabase target ports:** 54330–54340

---

## Port Map (occupied + planned)

| Port | Service |
|------|---------|
| 80/443 | nginx (currently failed) |
| 5432 | Coolify DB |
| 54321 | Supabase (imi) API/Kong |
| 54322 | Supabase (imi) DB |
| 54323 | Supabase (imi) Studio |
| 54324–54327 | Supabase (imi) SMTP/IMAP/POP3/Analytics |
| 54331 | **NEW** Supabase (lions) Kong |
| 54332 | **NEW** Supabase (lions) DB |
| 54333 | **NEW** Supabase (lions) Studio |
| 54337 | **NEW** Supabase (lions) Analytics |
| 8080 | Coolify HTTP |
| 8443 | Coolify HTTPS |
| 8889 | Coolify (main) |
| 3001 | internetmusicindex-staging |
