# Production Deployment — lewisportlions.club

**Last updated:** April 18, 2026
**CI Status:** GREEN
**Site:** https://lewisportlions.club (live)

---

## Completed

| Item | Status |
|------|--------|
| CI pipeline | Done |
| Supabase on ports 54331-54337 | Done |
| nginx + SSL for lewisportlions.club | Done |
| DNS pointing to server | Done |

---

## Remaining

### 1. Create Coolify app for lionsclub-web

1. Go to Coolify dashboard → New Application
2. Name: `lionsclub-web`
3. Git: `https://github.com/DoloMike/lionsclub-web`, branch `main`
4. Build pack: Dockerfile (`docker/Dockerfile` in repo)
5. Port: `3000` (container port, do NOT publish to host)

**Required env vars:**

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `http://host.docker.internal:54341` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From Lions Supabase `.env` |
| `SUPABASE_SERVICE_ROLE_KEY` | From Lions Supabase `.env` |
| `NEXT_PUBLIC_APP_URL` | `https://lewisportlions.club` |
| `NEXT_PUBLIC_SITE_TIMEZONE` | `America/Kentucky/Louisville` |
| `NEXT_PUBLIC_NOINDEX` | `false` |
| `STRIPE_SECRET_KEY` | Live or test Stripe key |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Production Google OAuth client |

**Networking:** Coolify manages the `coolify` network. The app reaches Supabase via `host.docker.internal:54341` (the host's mapped port for Kong).

After creation, copy the app UUID and set it as `COOLIFY_APPLICATION_UUID` secret.

### 2. Set GitHub Actions secrets

```bash
gh secret set COOLIFY_HOST --body "https://staging.deploys.internetmusicindex.com"
gh secret set COOLIFY_APPLICATION_UUID --body "<UUID from Coolify>"
gh secret set COOLIFY_TOKEN --body "<from Coolify Settings > API Tokens>"
gh secret set TAILSCALE_OAUTH_CLIENT_ID --body "<from tailscale.com/admin/settings/oauth-clients>"
gh secret set TAILSCALE_OAUTH_CLIENT_SECRET --body "<from tailscale.com/admin/settings/oauth-clients>"
```

### 3. Supabase — real JWT keys and migrations

The current `.env` at `~/dev/lionsclub-web/.env` has placeholder JWT keys. Generate real ones:

```bash
# From the Lions Supabase install:
# ~/dev/lionsclub-web/.env has the actual values
# POSTGRES_PASSWORD is also there

# Then apply migrations:
supabase db push
```

Also update `ADDITIONAL_REDIRECT_URLS` in Supabase Auth config for the production domain.

---

## Server Infrastructure

**This is server-managed, NOT in the repo:**

- nginx vhost: `/etc/nginx/sites-available/lewisportlions.club`
- SSL certs: `/etc/letsencrypt/live/lewisportlions.club/`
- nginx auto-renews certs via Certbot DNS Cloudflare
- Supabase containers: `/home/clawuser/lionsclub-supabase/`

**To update nginx/SSL on the server:**

```bash
# SSL cert (if DNS changes):
sudo certbot certonly \
  --dns-cloudflare \
  --dns-cloudflare-credentials /etc/letsencrypt/cloudflare.d/credentials.ini \
  -d lewisportlions.club \
  --agree-tos --email dolomikeclaw@gmail.com --non-interactive

# Reload nginx:
sudo nginx -t && sudo systemctl reload nginx
```

---

## Port Map

| Port | Service |
|------|---------|
| 80/443 | System nginx (all sites) |
| 54321 | Supabase (imi) Kong |
| 54322 | Supabase (imi) DB |
| 54331 | Lions Supabase Kong |
| 54332 | Lions Supabase DB |
| 54333 | Lions Supabase Studio |
| 54337 | Lions Supabase Analytics |
| 54341 | Lions Kong (mapped host port) |
| 8889 | Coolify |
