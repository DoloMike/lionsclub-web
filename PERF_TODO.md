# Performance & architecture audit — **completed**

All items from the 2026 audit were implemented. Summary:

| ID | Topic | What changed |
|----|--------|----------------|
| **P0-1** | Auth hydration | `getSessionProfile()` in root layout seeds `SessionProfileProvider` (`initial` prop). Client only subscribes to `onAuthStateChange` — no loading skeleton in header/nav. |
| **P0-2** | Fundraiser banner | Server computes `getFundraiserBannerSegments(session)` vs `getCachedPublicFundraiserBannerSegments()`; removed client fetch, `/api/me/fundraiser-banner-segments`, `FundraiserOrderBannerContainer`, and `FundraiserOrderBannerSkeleton`. |
| **P0-3** | Chicken orders query | Single `.or()` query for paid `event_id`s; migration adds partial indexes on `user_id` / `lower(customer_email)` (paid) + `event_id` (non-cancelled). |
| **P0-4** | Cache tags vs full layout | `unstable_cache` tags on meeting schedule, social links, officers, chapter events; admin actions use `updateTag(...)` instead of `revalidatePath("/", "layout")` for those surfaces. |
| **P0-5** | Inventory sum | SQL `chicken_event_sold(uuid)` + checkout route uses `.rpc()`; migration ships function + index. |
| **P1-6** | Back to top | Scroll handler throttled with `requestAnimationFrame`; visibility gated with `!enabled \|\| !visible` (no sync `setState` in effect). |
| **P1-7** | Browser Supabase | `createBrowserSupabaseClient()` returns a singleton. |
| **P1-8** | Loading UI | `loading.tsx` for `/events`, `/fundraising`, `/fundraising/order`, admin fundraiser stats. |
| **P1-9** | Middleware matcher | Excludes entire `/api/*` from middleware (plus existing static skips). |
| **P1-10** | Lighter middleware auth | `getSession()` instead of `getUser()` (fewer forced round-trips). `getClaims()` not available in current `@supabase/ssr` typings — skipped. |
| **P1-11** | Stripe idempotency | `checkout.sessions.create(..., { idempotencyKey })` derived from event, email, quantity, date. |
| **P1-12** | Lions logo | Plain `<img>` with `decoding` / `fetchPriority` instead of `next/image` for SVG. |
| **P1-13** | Banner CTA prefetch | Removed `prefetch={false}` on “Order chickens”. |

**Verify locally:** `bun run type-check`, `bun run lint`, `bun run test`, `bun run build`.

**DB:** Apply `supabase/migrations/20260419200000_chicken_orders_perf.sql` so `chicken_event_sold` and indexes exist before relying on checkout RPC.

---

# Round 2 — follow-ups from second review (completed)

| ID | Topic | What changed |
|----|--------|----------------|
| **R2-1** | Stripe webhook | New `app/api/webhooks/stripe/route.ts` (Node runtime, raw body) verifies signatures and inserts paid orders via shared `recordPaidChickenOrder()` helper. Webhook is the durable writer; the return page calls the same helper as a fallback for the user-stays-on-page path. Both writers are idempotent via the existing `chicken_orders.stripe_checkout_session_id` unique index (23505 treated as success). Helper calls `updateTag("chicken-orders")` after a real insert so the buyer's banner suppresses the just-paid event on the next request. |
| **R2-2** | Webhook env | `env.stripe.webhookSecret` (`STRIPE_WEBHOOK_SECRET`) + `isStripeWebhookConfigured()` helper. Webhook returns 503 if not configured, 400 on bad signature, 500 on DB error so Stripe retries with backoff. Set `STRIPE_WEBHOOK_SECRET=whsec_…` in production; locally use `stripe listen --forward-to localhost:3000/api/webhooks/stripe`. |
| **R2-3** | Guest cookie short-circuit | `getSessionProfile()` and `getSessionUser()` now read `cookies()` first and bail when no `sb-*` cookie is present — guests no longer trigger a Supabase `getUser()` round trip or a `profiles` query for every page render. Mirrors the existing middleware optimization. |
| **R2-4** | Cached profile role | New `getCachedProfileRole(userId)` in `src/lib/data/profile.ts` (`unstable_cache`, 5 min revalidate, tagged `profile-role` and `profile-role:<userId>`). `getSessionProfile()` uses it; admin role-change actions can call `updateTag(\`profile-role:${userId}\`)` for instant invalidation. |
| **R2-5** | `assertAdmin` cleanup | Now delegates to `getSessionAdmin()` (which uses request-level `react.cache` + the new role cache) instead of doing its own `getUser()` + `profiles` query. Server actions running on a page that already loaded the session reuse the cached lookups. Error collapsed to single `Forbidden` message — distinction wasn't surfaced to users. |
| **R2-6** | Browser singleton test escape hatch | `__resetBrowserSupabaseClient()` exported from `@/lib/supabase/browser` for tests that don't `vi.resetModules()`. |
| **R2-7** | Tests | Added: `record-paid-chicken-order.test.ts`, `profile-role.test.ts`, `stripe-webhook-route.test.ts`. Updated: `get-session.test.ts` (cookies mock + cached role mock), `assert-admin.test.ts` (delegates to mocked `getSessionAdmin`). |

**Net effect.**
- Guests: zero Supabase calls per page render (cookies short-circuit).
- Signed-in users: 1× `getUser()` (network), 1× cached profile role, 0–1× cached banner row read. Profile role lookup is now a 5-minute cache hit instead of a per-request DB query.
- Paid orders are durable even if the customer closes the tab — webhook captures every `checkout.session.completed`. Cache tag invalidation makes the buyer's site-wide banner update immediately on the next request.

**Stripe webhook setup checklist.**
1. Add a webhook endpoint in the Stripe dashboard pointing at `https://<host>/api/webhooks/stripe`.
2. Subscribe to `checkout.session.completed` (and `checkout.session.async_payment_succeeded` if you ever enable delayed payment methods).
3. Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
4. Local dev: `stripe listen --forward-to localhost:3000/api/webhooks/stripe` and use the printed `whsec_…` for `STRIPE_WEBHOOK_SECRET` in `.env.local`.
