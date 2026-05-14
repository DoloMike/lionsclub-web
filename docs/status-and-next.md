# Status & next steps

**Last updated:** May 2026  

Single place for **what’s done** in this repo and **what’s next**. Deeper product history and IA live in [lewisport-lions-site-plan.md](lewisport-lions-site-plan.md); the long UX audit lives in [ux-review.md](ux-review.md) (baseline, not a live checklist).

---

## Done (shipped in code)

- **Public site:** Core routes — home, about, service, events, fundraising, chicken order + Stripe return, membership, contact, privacy, terms, login; skip link, header/footer, mobile nav, active nav states, theme toggle.
- **Content & trust:** Chapter copy, fundraiser trust callouts, expanded privacy/terms, footer trust block, warm section styling, home hero + community card, campaign banner polish, empty/success patterns where implemented.
- **Supabase:** Migrations for `site_settings`, officers, chapter events, social links, `profiles` (roles: `guest` / `member` / `admin`), `fundraiser_events`, `chicken_orders`, `heritage_festival_signups`, `volunteer_events` / `volunteer_shifts` / `volunteer_signups`, `site_photos` + `site-photos` Storage bucket. Local CLI defaults to API **55421** (see `supabase/config.toml`).
- **Auth:** Google sign-in for admins (`/admin/login`, `/auth/callback`); session refresh via `proxy.ts` (Next 16 file-convention proxy, formerly `middleware.ts`). Account menu: guests see “Become a Member”; members/admins don’t.
- **Admin:** Dashboard, meeting schedule, social links, officers, events, fundraisers (CRUD + ordering toggle). Per-fundraiser **stats** (`/admin/fundraiser/[eventId]/stats`, opens in a new tab) and **CSV export** (`GET /api/admin/fundraiser/[eventId]/orders-csv`). Closed/past fundraiser cards collapse their edit form by default; "deadline passed while ordering open" cards highlight in red and stay expanded.
- **Admin UI consistency:** Every admin page now uses the same patterns — `<AdminAddCard>` for collapsible "Add ___" panels, shared class-name constants in `src/components/admin/admin-form-styles.ts` for primary buttons / labels / inputs / destructive links, and `bg-card` containers so list items don't blend into the page background.
- **Heritage Festival 2026 sign-ups:** Dedicated public sheet at `/heritage-festival-2026-signup` with a fixed set of dates (Booth Setup → 3 festival days → Booth Tear Down), free-text name input (no auth required), and an optional outbound **webhook notification** per signup — HMAC-SHA256-signed POST sent when `HERITAGE_FESTIVAL_SIGNUP_NOTIFY_WEBHOOK_URL` is set (signing secret optional via `…_WEBHOOK_SECRET`).
- **Volunteer sign-ups:** Generic admin-managed signup sheets at `/admin/volunteer` and public pages at `/volunteer/<slug>` (plus a `/volunteer` index of published events). Each event has multiple shifts (date + optional label + free-text time + optional cap); admins publish + toggle signups-open independently. **Sign-ups require a Google sign-in** — names are pulled from `user_metadata` (no free-text input), one signup per user per shift via a partial unique index, and users can remove their own signup. Published events also surface on `/events` under a "Volunteer Sign-Ups" section. The hardcoded Heritage Festival 2026 sheet above is left as-is.
- **Site photos:** Admin-managed banner photos at `/admin/photos` organized by section key (`SITE_PHOTO_SECTIONS` in `src/lib/photo-sections.ts`). Currently wired to the **Fundraising page** banner. Uploads accept JPEG/PNG/WEBP/AVIF (≤10 MB), are auto-rotated via EXIF, resized to ≤1920×1920, EXIF-stripped, and re-encoded as WebP server-side via `sharp`. Multi-file upload and drag-to-reorder (via `@dnd-kit`) supported. Public bucket `site-photos` serves the optimized files directly.
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
  - `HERITAGE_FESTIVAL_SIGNUP_NOTIFY_WEBHOOK_URL` — optional; when set, each Heritage Festival sign-up POSTs a JSON payload here. Pair with `HERITAGE_FESTIVAL_SIGNUP_NOTIFY_WEBHOOK_SECRET` to receive an HMAC signature in the `X-Webhook-Signature` header.
- **Supabase (prod):** Migrations from `supabase/migrations/` are applied automatically by the deploy workflow (see "Deploy / rollback playbook" below). Auth → URL configuration includes `https://lewisportlions.club` + `/auth/callback`; Google provider's authorized redirect URIs include Supabase's callback URL. The public `site-photos` Storage bucket is provisioned by the migration that creates it.
- **Stripe (prod):** Live mode enabled. **Settings → Emails → Successful payments** is on so Stripe auto-emails the buyer; the app also sets `payment_intent_data.receipt_email` per Checkout Session as a belt-and-suspenders so receipts keep firing even if that dashboard toggle is ever flipped off.
  - **Test/sandbox caveat:** Stripe **does not** auto-send customer receipts in test or sandbox mode, even when `receipt_email` is set and the dashboard toggle is on. The Charge is still generated with a `receipt_url` and a manual **Send receipt** from the Charge page in the dashboard delivers to a real inbox (good for verifying template + branding + deliverability without going to live mode). Auto-sends only fire under live keys — to spot-check prod, open any successful payment in the live dashboard and look at **Receipt history** on the Charge.

### Deploy / rollback playbook

- **Deploy:** Merge to `main`. The **Migrate and Deploy** GitHub Actions workflow (`.github/workflows/deploy.yml`) runs `supabase db push --db-url $SUPABASE_DB_URL --yes` against the production project, then triggers the Coolify deploy. Watch the workflow run + the Coolify deployment log for the new container coming healthy. Sanity check: `curl https://lewisportlions.club/api/health` should return `{"status":"ok"}`.
- **Rollback:** In Coolify, redeploy the previous successful image, **or** `git revert <bad-sha> && git push` and let the pipeline re-deploy. Reverting a *migration* requires a forward-only "undo" migration in `supabase/migrations/` — never delete an already-applied migration file.
- **Migrations:** `AGENTS.md` rule applies — never commit a migration under `supabase/migrations/` until you've applied it locally and confirmed it runs cleanly. **Prod migrations are automatic** via the deploy workflow above; no manual `supabase db push` is required.

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

