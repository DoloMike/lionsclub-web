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
- **Chicken fundraising:** Guest Stripe Checkout (`STRIPE_SECRET_KEY`); order row written after paid return; deadlines enforced in app; inventory checks at checkout when capped.

---

## Next — production deploy (do this first)

1. **Hosting** — Repo already has **Docker** (`docker/docker-compose.yml`) and **GitHub Actions → Coolify** (`.github/workflows/`). Pick one path and document the live URL for the team.
2. **Environment (production)** — Set at least:
   - `NEXT_PUBLIC_APP_URL` — canonical `https://your-domain` (Stripe success/cancel URLs and metadata depend on it).
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — **production** Supabase project.
   - `STRIPE_SECRET_KEY` — **`sk_live_…`** when you’re ready for real payments (keep test keys on staging only).
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — production OAuth client if you use Google sign-in / One Tap on the public site.
   - `NEXT_PUBLIC_NOINDEX` — `false` for production (use `true` on staging/preview).
   - `NEXT_PUBLIC_SITE_TIMEZONE` — e.g. `America/Kentucky/Louisville` if different from default.
3. **Supabase (prod)** — Run the same migrations as local (`supabase/migrations/` order) on the production database. Configure **Auth → URL configuration** with production site URL + `/auth/callback`. **Google provider:** authorized redirect URIs must include Supabase’s callback URL.
4. **Stripe (prod)** — Enable live mode; confirm **Checkout** redirect URLs match your domain; enable customer receipt emails in Dashboard (**Settings → Emails → Successful payments**) so buyers get a receipt. The chicken-order route also sets `payment_intent_data.receipt_email` per session as a belt-and-suspenders, so even if the dashboard toggle ever flips off the per-session request still asks Stripe to email.
   - **Test/sandbox caveat:** Stripe **does not** auto-send customer receipts in test or sandbox mode, even when `receipt_email` is set and the dashboard toggle is on. The Charge is still generated with a `receipt_url` and a manual **Send receipt** from the Charge page in the dashboard delivers to a real inbox (good for verifying template + branding + deliverability). Auto-sends only fire under live keys — verify in step 5.
5. **Smoke test** — Health check `GET /api/health`, key public pages, admin login, one test order with **live** card in a controlled dry run (or final verification on staging with live keys behind auth). Confirm the Stripe receipt actually lands in the buyer's inbox within ~30s — this is the only definitive test of the auto-send path since test mode suppresses it.

---

## Next — optional / later

- **Member portal** (`/member/…`), **verification queue**, richer **admin orders** hub across all events (per-event stats + CSV exist today).
- **App-sent email** for orders (beyond Stripe’s receipt), webhooks for reconciliation, stricter inventory under high concurrency if needed.
- **SEO / ops:** Confirm NAP and JSON-LD, Search Console, monitoring.

---

## Related

- [README.md](../README.md) — stack, env table, local dev, Docker, CI secrets.
- [lewisport-lions-site-plan.md](lewisport-lions-site-plan.md) — full product spec and roadmap detail.
- [ux-review.md](ux-review.md) — historical UX review (supplemental).
