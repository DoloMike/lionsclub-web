/**
 * Playwright config for MANUAL local end-to-end tests.
 *
 * These tests are intentionally NOT wired into CI:
 *   - `bun run test` (CI) runs Vitest, which is configured to ignore `e2e/`.
 *   - `tsconfig.json` and `eslint.config.mjs` exclude `e2e/` so type-check
 *     and lint stay green in CI without installing browsers.
 *
 * Run locally with:
 *   bun run e2e            # headless, auto-detects http vs https on :3000
 *   bun run e2e:ui         # Playwright UI mode
 *   bun run e2e:headed     # Headed Chromium so you can watch it click
 *
 * Requirements before first run:
 *   1. `bunx playwright install chromium`
 *   2. A Stripe TEST-mode `STRIPE_SECRET_KEY` in `.env.local`.
 *   3. At least one open fundraiser event in the local Supabase DB.
 *   4. A dev server running (or let Playwright start one — see `webServer`).
 *      Either `bun run dev` (https) or `bun run dev:http` works; the
 *      `detectBaseUrl()` helper below picks the right protocol.
 *      Override with `E2E_BASE_URL=...` if needed.
 */
import { spawnSync } from "node:child_process";
import { defineConfig, devices } from "@playwright/test";

/**
 * Pick the right base URL for whatever dev server is already running.
 *
 * The repo's default `bun run dev` uses `next --experimental-https`, so the
 * common local setup is https://localhost:3000 with a self-signed cert.
 * Probing that URL with a vanilla fetch fails the TLS handshake, which made
 * Playwright (a) think no server was up and (b) try to start its own
 * `bun run dev:http`, which then collides on port 3000 and aborts the run.
 *
 * We probe https first, then http, with a tiny Node subprocess that does a
 * 2s HEAD request and ignores cert errors. If neither responds we fall back
 * to http://localhost:3000 so Playwright's `webServer` can start one.
 */
function probeUrl(url: string): boolean {
  const result = spawnSync(
    process.execPath,
    [
      "-e",
      `const u = new URL(${JSON.stringify(url)});
       const lib = require(u.protocol === 'https:' ? 'https' : 'http');
       const req = lib.request({
         method: 'HEAD',
         hostname: u.hostname,
         port: u.port,
         path: '/',
         timeout: 2000,
         rejectUnauthorized: false,
       }, () => process.exit(0));
       req.on('error', () => process.exit(1));
       req.on('timeout', () => process.exit(1));
       req.end();`,
    ],
    { stdio: "ignore", timeout: 5_000 },
  );
  return result.status === 0;
}

function detectBaseUrl(): string {
  if (process.env.E2E_BASE_URL) return process.env.E2E_BASE_URL;
  if (probeUrl("https://localhost:3000/")) return "https://localhost:3000";
  if (probeUrl("http://localhost:3000/")) return "http://localhost:3000";
  return "http://localhost:3000";
}

const BASE_URL = detectBaseUrl();

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
