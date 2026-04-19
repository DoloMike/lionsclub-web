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
