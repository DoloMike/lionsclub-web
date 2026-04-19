/**
 * Playwright config for MANUAL local end-to-end tests.
 *
 * These tests are intentionally NOT wired into CI:
 *   - `bun run test` (CI) runs Vitest, which is configured to ignore `e2e/`.
 *   - `tsconfig.json` and `eslint.config.mjs` exclude `e2e/` so type-check
 *     and lint stay green in CI without installing browsers.
 *
 * Run locally with:
 *   bun run e2e            # headless, against http://localhost:3000
 *   bun run e2e:ui         # Playwright UI mode
 *   bun run e2e:headed     # Headed Chromium so you can watch it click
 *
 * Requirements before first run:
 *   1. `bunx playwright install chromium`
 *   2. A Stripe TEST-mode `STRIPE_SECRET_KEY` in `.env.local` (and either
 *      `NEXT_PUBLIC_APP_URL=http://localhost:3000` or just rely on origin).
 *   3. At least one open fundraiser event in the local Supabase DB.
 *   4. A dev server running (or let Playwright start one — see `webServer`).
 */
import { defineConfig, devices } from "@playwright/test";

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  // Custom suffix avoids collisions with Vitest's `*.test.ts` discovery.
  testMatch: /.*\.e2e\.ts$/,
  // Stripe Checkout is hosted off-site; redirects + 3DS-style screens can
  // take a while in test mode. Generous timeouts beat flaky retries.
  timeout: 120_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL: BASE_URL,
    // Next.js' `--experimental-https` dev server uses a self-signed cert.
    // Harmless for plain HTTP and required when E2E_BASE_URL is https.
    ignoreHTTPSErrors: true,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // If a dev server is already running on the same port, reuse it; otherwise
  // start `bun run dev:http`. We use the HTTP variant because the HTTPS dev
  // mode requires a self-signed cert that Playwright/Stripe wouldn't trust.
  webServer: {
    command: "bun run dev:http",
    url: BASE_URL,
    reuseExistingServer: true,
    // Same self-signed-cert reason as `use.ignoreHTTPSErrors` above —
    // without this the reuse probe rejects an https dev server and
    // Playwright tries to spawn a duplicate one.
    ignoreHTTPSErrors: true,
    timeout: 120_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
