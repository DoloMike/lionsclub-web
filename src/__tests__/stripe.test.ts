import { afterEach, describe, expect, it, vi } from "vitest";

describe("getStripe", () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-anon-key");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-service-role");
  });

  it("returns null when STRIPE_SECRET_KEY is empty", async () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "");
    vi.resetModules();
    const { getStripe } = await import("@/lib/stripe");
    expect(getStripe()).toBeNull();
  });

  it("returns a Stripe client when key is set", async () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_123456789012345678901234");
    vi.resetModules();
    const { getStripe } = await import("@/lib/stripe");
    const client = getStripe();
    expect(client).not.toBeNull();
    const again = getStripe();
    expect(again).toBe(client);
  });
});
