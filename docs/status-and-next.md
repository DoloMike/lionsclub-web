# Status & next steps

**Last updated:** April 2026  

Single place for **what’s done** in this repo and **what’s next**. Deeper product history and IA live in [lewisport-lions-site-plan.md](lewisport-lions-site-plan.md); the long UX audit lives in [ux-review.md](ux-review.md) (baseline, not a live checklist).

---

## Done (shipped in code)

- **Public site:** Core routes — home, about, service, events, fundraising, chicken order + Stripe return, membership, contact, privacy, terms, login; skip link, header/footer, mobile nav, active nav states, theme toggle.
- **Content & trust:** Chapter copy, fundraiser trust callouts, expanded privacy/terms, footer trust block, warm section styling, home hero + community card, campaign banner polish, empty/success patterns where implemented.
- **Supabase:** Migrations for `site_settings`, officers, chapter events, social links, `profiles` (roles: `guest` / `member` / `admin`), `fundraiser_events`, `chicken_orders`. Local CLI defaults to API **55421** (see `supabase/config.toml`).
- **Auth:** Google sign-in for admins (`/admin/login`, `/auth/callback`); session refresh via `proxy.ts` (Next 16 file-convention proxy, formerly `middleware.ts`). Account menu: guests see “Become a Member”; members/admins don’t.
- **Admin:** Dashboard, meeting schedule, social links, officers, events, fundraisers (CRUD + ordering toggle). Per-fundraiser **stats** (`/admin/fundraiser/[eventId]/stats`) and **CSV export** (`GET /api/admin/fundraiser/[eventId]/orders-csv`).
- **Chicken fundraising:** Guest Stripe Checkout (`STRIPE_SECRET_KEY`); order row written after paid return; deadlines enforced in app; inventory checks at checkout when capped. Buyer receipts via Stripe (per-session `payment_intent_data.receipt_email` + Dashboard **Successful payments** toggle).
- **Production deploy:** Live at **[https://lewisportlions.club](https://lewisportlions.club)**. Real customers have signed in and ordered chickens end-to-end.

---

## Operating notes — production

The site is live. This section describes how prod is configured today, not what you need to do.

- **Hosting:** Self-hosted **Coolify** on a **Hetzner** VPS. `git push` to `main` triggers GitHub Actions (`.github/workflows/`) which tells Coolify to pull and redeploy the container built from `docker/docker-compose.yml`.
- **Edge / DNS:** **Cloudflare** owns `lewisportlions.club` and proxies (orange-cloud) to the Hetzner origin — so Cloudflare terminates TLS, runs WAF / rate-limiting at the edge, and the origin only needs to serve plain HTTP behind it. The origin must trust Cloudflare's IPs as the real-client source if you ever need accurate `request.ip`.
- **Environment (prod):** Set in Coolify, not in the repo:
  - `NEXT_PUBLIC_APP_URL` — `https://lewisportlions.club` (Stripe success/cancel URLs and metadata depend on it).
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — **production** Supabase project.
  - `STRIPE_SECRET_KEY` — `**sk_live_…`** (test keys stay on dev/sandbox only).
  - `STRIPE_WEBHOOK_SECRET` — `whsec_…` from the live-mode webhook endpoint registered against `https://lewisportlions.club/api/webhooks/stripe`.
  - `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — production OAuth client.
  - `NEXT_PUBLIC_NOINDEX` — `false` in prod (`true` on any preview / staging URLs).
  - `NEXT_PUBLIC_SITE_TIMEZONE` — `America/Kentucky/Louisville`.
- **Supabase (prod):** Migrations from `supabase/migrations/` are applied to the production project. Auth → URL configuration includes `https://lewisportlions.club` + `/auth/callback`; Google provider's authorized redirect URIs include Supabase's callback URL.
- **Stripe (prod):** Live mode enabled. **Settings → Emails → Successful payments** is on so Stripe auto-emails the buyer; the app also sets `payment_intent_data.receipt_email` per Checkout Session as a belt-and-suspenders so receipts keep firing even if that dashboard toggle is ever flipped off.
  - **Test/sandbox caveat:** Stripe **does not** auto-send customer receipts in test or sandbox mode, even when `receipt_email` is set and the dashboard toggle is on. The Charge is still generated with a `receipt_url` and a manual **Send receipt** from the Charge page in the dashboard delivers to a real inbox (good for verifying template + branding + deliverability without going to live mode). Auto-sends only fire under live keys — to spot-check prod, open any successful payment in the live dashboard and look at **Receipt history** on the Charge.

### Deploy / rollback playbook

- **Deploy:** Merge to `main`. GitHub Actions hands off to Coolify; watch the Coolify deployment log for the new container coming healthy. Sanity check: `curl https://lewisportlions.club/api/health` should return `{"status":"ok"}`.
- **Rollback:** In Coolify, redeploy the previous successful image, **or** `git revert <bad-sha> && git push` and let the pipeline re-deploy.
- **Migrations:** `AGENTS.md` rule applies — never commit a migration under `supabase/migrations/` until you've applied it locally and confirmed it runs cleanly. For prod, apply migrations against the prod Supabase project before / alongside the deploy that needs them.

---

## Next — optional / later

- **Member dues & directory:** Likely the next real feature — collect annual member dues (Stripe Checkout, mirroring the chicken-order flow) and keep member contact info / mailing addresses current. Open questions: dues amount + cadence (annual vs. recurring subscription), whether members self-serve updates from a `/member/profile` page or admins edit on their behalf, and whether the directory should be visible to other members or admin-only.
- **Member portal** (`/member/…`), **verification queue**, richer **admin orders** hub across all events (per-event stats + CSV exist today).
- **App-sent email** for orders (beyond Stripe’s receipt), webhooks for reconciliation, stricter inventory under high concurrency if needed.
- **SEO / ops:** Confirm NAP and JSON-LD, Search Console, monitoring.

---

## Related

- [README.md](../README.md) — stack, env table, local dev, Docker, CI secrets.
- [lewisport-lions-site-plan.md](lewisport-lions-site-plan.md) — full product spec and roadmap detail.
- [ux-review.md](ux-review.md) — historical UX review (supplemental).

