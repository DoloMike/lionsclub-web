import { afterEach, describe, expect, it, vi } from "vitest";

describe("getSupabaseAdmin", () => {
  afterEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-anon-key");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-service-role");
    vi.resetModules();
  });

  it("returns singleton client", async () => {
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    const a = getSupabaseAdmin();
    const b = getSupabaseAdmin();
    expect(a).toBe(b);
  });

  it("throws when not configured", async () => {
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    vi.resetModules();
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    expect(() => getSupabaseAdmin()).toThrow("Supabase is not configured");
  });
});
