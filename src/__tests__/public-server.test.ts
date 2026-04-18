import { afterEach, describe, expect, it, vi } from "vitest";

describe("createPublicServerClient", () => {
  afterEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-anon-key");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-service-role");
    vi.resetModules();
  });

  it("returns null when Supabase is not fully configured", async () => {
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    vi.resetModules();
    const { createPublicServerClient } = await import(
      "@/lib/supabase/public-server"
    );
    expect(createPublicServerClient()).toBeNull();
  });

  it("returns a client when configured", async () => {
    const { createPublicServerClient } = await import(
      "@/lib/supabase/public-server"
    );
    const c = createPublicServerClient();
    expect(c).not.toBeNull();
  });
});
