import { afterEach, describe, expect, it, vi } from "vitest";

describe("env helpers", () => {
  afterEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-anon-key");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-service-role");
    vi.stubEnv("STRIPE_SECRET_KEY", "");
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_CLIENT_ID", "");
    vi.resetModules();
  });

  it("isSupabaseConfigured is true with vitest defaults", async () => {
    const { isSupabaseConfigured } = await import("@/lib/env");
    expect(isSupabaseConfigured()).toBe(true);
  });

  it("isSupabaseConfigured is false when service role missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://x.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    vi.resetModules();
    const { isSupabaseConfigured } = await import("@/lib/env");
    expect(isSupabaseConfigured()).toBe(false);
  });

  it("isStripeConfigured reflects STRIPE_SECRET_KEY", async () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_abc");
    vi.resetModules();
    const { isStripeConfigured } = await import("@/lib/env");
    expect(isStripeConfigured()).toBe(true);
  });

  it("isGoogleOneTapConfigured reflects client id", async () => {
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_CLIENT_ID", "abc.apps.googleusercontent.com");
    vi.resetModules();
    const { isGoogleOneTapConfigured } = await import("@/lib/env");
    expect(isGoogleOneTapConfigured()).toBe(true);
  });
});
