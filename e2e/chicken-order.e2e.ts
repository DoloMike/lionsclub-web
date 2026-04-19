/**
 * Manual end-to-end test: order a chicken, pay with the Stripe test card,
 * land on the confirmation page.
 *
 * SAFETY: this test refuses to run unless STRIPE_SECRET_KEY is a TEST key
 * (sk_test_…) and the base URL is localhost. It will never charge a real
 * card because Stripe Checkout is created from the dev server's own
 * STRIPE_SECRET_KEY, which we read from `.env.local`.
 *
 * Prereqs (one-time):
 *   - `bunx playwright install chromium`
 *   - `.env.local` contains a `sk_test_…` STRIPE_SECRET_KEY
 *   - At least one fundraiser exists in the local DB with `order_open=true`,
 *     `event_date` in the future, and orders deadline not passed.
 *
 * Run:
 *   bun run e2e
 */
import { expect, test, type Page } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

// Pull STRIPE_SECRET_KEY from `.env.local` so we can sanity-check it before
// kicking off a real-ish payment flow. We don't depend on dotenv here so the
// e2e folder stays free of extra deps.
function readStripeSecretFromEnvLocal(): string | null {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return null;
  const raw = readFileSync(path, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*STRIPE_SECRET_KEY\s*=\s*(.+?)\s*$/);
    if (m) return m[1].replace(/^["']|["']$/g, "");
  }
  return null;
}

const STRIPE_KEY =
  process.env.STRIPE_SECRET_KEY ?? readStripeSecretFromEnvLocal() ?? "";

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(
  BASE_URL,
);
const isTestKey = STRIPE_KEY.startsWith("sk_test_");

/**
 * The order form's `<label>` elements aren't tied to their inputs via
 * `htmlFor`, so `getByLabel(...)` is unreliable. We anchor each control to
 * its sibling label text via XPath instead — this is resilient to
 * surrounding markup changes as long as the visible label text stays.
 */
function fieldNextToLabel(page: Page, label: string) {
  return page.locator(
    `xpath=//label[normalize-space(.)="${label}"]/following-sibling::*[self::input or self::select or self::textarea][1]`,
  );
}

test.describe("Chicken ordering — manual e2e (Stripe test mode only)", () => {
  test.skip(
    !isLocalhost,
    `Refusing to run: E2E_BASE_URL must be localhost (got ${BASE_URL}).`,
  );
  test.skip(
    !isTestKey,
    "Refusing to run: STRIPE_SECRET_KEY must be a Stripe TEST key (sk_test_…).",
  );

  test("places an order and reaches the confirmation page", async ({
    page,
  }) => {
    test.setTimeout(120_000);

    await page.goto("/fundraising/order");
    await expect(
      page.getByRole("heading", { name: "Order chicken" }),
    ).toBeVisible();

    const fundraiserSelect = fieldNextToLabel(page, "Fundraiser");
    await expect(fundraiserSelect).toBeVisible();
    const optionCount = await fundraiserSelect.locator("option").count();
    test.skip(
      optionCount === 0,
      "No open fundraisers in the local DB — seed one and rerun.",
    );

    // Use a unique test email so Stripe test customer records are easy to
    // grep for in the dashboard / logs. Override with `E2E_BUYER_EMAIL` when
    // you want the Stripe test-mode receipt to land in a real inbox so you
    // can verify deliverability end-to-end.
    //
    // The chicken-order route's idempotency key is
    // `chk_<eventId>_<email>_<qty>_<YYYY-MM-DD>`, so two runs with the same
    // email + quantity + event in the same day collide on Stripe's side.
    // To make the override safe to re-run, we splice a per-run tag into the
    // local part using `+` aliasing — Gmail/Outlook ignore the suffix when
    // routing to the inbox but Stripe sees a brand-new email each time.
    const stamp = Date.now();
    const buyerOverride = process.env.E2E_BUYER_EMAIL?.trim();
    const email = buyerOverride
      ? buyerOverride.replace(
          /^([^+@]+)(\+[^@]*)?(@.+)$/,
          `$1+lions-e2e-${stamp}$3`,
        )
      : `e2e+chicken-${stamp}@example.com`;

    await fieldNextToLabel(page, "Quantity").selectOption({ index: 0 });
    await fieldNextToLabel(page, "Name (optional)").fill("E2E Test Buyer");
    await fieldNextToLabel(page, "Email (required)").fill(email);
    await fieldNextToLabel(page, "Phone (optional)").fill("555-555-0123");
    await fieldNextToLabel(page, "Notes (optional)").fill(
      `automated e2e run ${new Date(stamp).toISOString()}`,
    );

    await Promise.all([
      page.waitForURL(/checkout\.stripe\.com/, { timeout: 30_000 }),
      page.getByRole("button", { name: /continue to payment/i }).click(),
    ]);

    // If the buyer's email is registered with Stripe Link, Checkout opens
    // straight into Link's "Confirm it's you" OTP screen instead of the
    // normal payment accordion. There's always a "Pay without Link" escape
    // hatch on those screens — click it so we drop back to the card form.
    const payWithoutLink = page.getByRole("button", {
      name: /pay without link/i,
    });
    if (await payWithoutLink.isVisible().catch(() => false)) {
      await payWithoutLink.click();
    }

    // The current Stripe Checkout layout is a payment-method accordion:
    // Link (with phone capture) is highlighted by default and Card is
    // collapsed. The "Card" radio is overlaid by an invisible accordion
    // click-area button — clicking the radio with force:true lets the
    // overlay receive the click and expand the section. We then key off
    // `cardNumber` actually appearing rather than the radio's checked state.
    const cardNumber = page.locator('input[name="cardNumber"]');
    if (!(await cardNumber.isVisible().catch(() => false))) {
      const cardRadio = page.getByRole("radio", { name: /^Card$/ });
      await cardRadio.waitFor({ state: "visible", timeout: 30_000 });
      await cardRadio.click({ force: true });
    }

    // Stripe's hosted Checkout form uses stable input names. If Stripe ever
    // renames them this test will fail loudly — which is what we want.
    await cardNumber.waitFor({ state: "visible", timeout: 15_000 });
    await cardNumber.fill("4242 4242 4242 4242");
    await page.locator('input[name="cardExpiry"]').fill("12 / 34");
    await page.locator('input[name="cardCvc"]').fill("123");

    const nameOnCard = page.locator('input[name="billingName"]');
    if (await nameOnCard.isVisible().catch(() => false)) {
      await nameOnCard.fill("E2E Test Buyer");
    }

    const postal = page.locator('input[name="billingPostalCode"]');
    if (await postal.isVisible().catch(() => false)) {
      await postal.fill("42050");
    }

    // Decline Link's "save my info" prompt so the flow stays on the card
    // path and doesn't try to capture a phone number.
    const saveLink = page.getByRole("checkbox", {
      name: /save my information/i,
    });
    if (
      (await saveLink.isVisible().catch(() => false)) &&
      (await saveLink.isChecked().catch(() => false))
    ) {
      await saveLink.uncheck();
    }

    await Promise.all([
      page.waitForURL(/\/fundraising\/order\/return/, { timeout: 60_000 }),
      page
        .locator(
          '[data-testid="hosted-payment-submit-button"], button[type="submit"]:has-text("Pay")',
        )
        .first()
        .click(),
    ]);

    await expect(
      page.getByRole("heading", {
        name: /thank you — your order is confirmed/i,
      }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/payment received/i)).toBeVisible();
  });
});
