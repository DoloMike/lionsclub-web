# Manual end-to-end tests

These Playwright tests are **manual** and **never run in CI**. They drive a
real Chromium against your local dev server and a Stripe **test-mode**
account.

> CI runs Vitest only (`bun run test`). The `e2e/` folder is excluded from
> Vitest, ESLint, and `tsc --noEmit` so it can't accidentally break CI.

## What's covered

- `chicken-order.e2e.ts` — full chicken-cook ordering flow:
  load `/fundraising/order` → fill the form → click **Continue to payment**
  → land on Stripe Checkout → pay with test card `4242 4242 4242 4242` →
  return to `/fundraising/order/return` → assert the success state.

## One-time setup

1. Install Playwright's Chromium build:
   ```bash
   bunx playwright install chromium
   ```
2. Make sure `.env.local` contains a **test-mode** Stripe secret key. The
   test refuses to run unless this starts with `sk_test_`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   ```
3. Make sure your local Supabase has at least one fundraiser row that the
   public `/fundraising/order` page would surface (`order_open=true`,
   future `event_date`, ordering deadline not yet passed). The test will
   gracefully `test.skip()` if nothing is open.

## Running

```bash
# Start the dev server in one terminal (or let Playwright start it for you)
bun run dev:http

# Then, in another terminal:
bun run e2e            # headless
bun run e2e:headed     # watch the browser drive it
bun run e2e:ui         # Playwright's interactive UI mode
```

The Playwright config has `reuseExistingServer: true`, so if you already
have `bun run dev:http` running on `:3000` it'll be reused; otherwise
Playwright will start it.

> Use `bun run e2e` (which delegates to the `playwright` shim in
> `node_modules/.bin/`, run by Node). Avoid `bunx playwright test` directly
> on Windows — Bun's loader currently double-loads `@playwright/test` and
> the runner aborts with "two different versions of @playwright/test".

## Stripe test cards

The test uses `4242 4242 4242 4242` (success). Other useful test cards if
you write more scenarios:

| Card                  | Behavior                            |
| --------------------- | ----------------------------------- |
| `4242 4242 4242 4242` | Successful payment                  |
| `4000 0025 0000 3155` | Requires authentication (3DS)       |
| `4000 0000 0000 9995` | Always declined (insufficient funds)|

Any future expiry (e.g. `12/34`) and any 3-digit CVC works in test mode.

## Why isn't this in CI?

- It needs a real Stripe test secret key — credentials we don't want in CI.
- Browsers are heavy to install on every CI run.
- Stripe's hosted Checkout DOM is owned by Stripe and can change without
  notice; we'd rather see those failures locally during a deliberate manual
  run than as flaky CI noise.

If you want to wire this into a separate, scheduled GitHub Action against a
preview deployment, treat it as a new project — don't add it to `ci.yml`.

## Artifacts

Failures produce screenshots, video, and a Playwright HTML report in
`playwright-report/` and `test-results/` (both gitignored).
