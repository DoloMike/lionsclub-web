import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@supabase/ssr", () => ({
  createBrowserClient: vi.fn(() => ({ mock: true })),
}));

describe("createBrowserSupabaseClient", () => {
  afterEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-anon-key");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    vi.resetModules();
  });

  it("throws when url or anon key missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    vi.resetModules();
    const { createBrowserSupabaseClient } = await import(
      "@/lib/supabase/browser"
    );
    expect(() => createBrowserSupabaseClient()).toThrow(
      "Supabase URL and anon key are required"
    );
  });

  it("creates browser client with cookie options", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://club.example.org");
    vi.resetModules();
    const { createBrowserClient } = await import("@supabase/ssr");
    const { createBrowserSupabaseClient } = await import(
      "@/lib/supabase/browser"
    );
    const client = createBrowserSupabaseClient();
    expect(client).toEqual({ mock: true });
    expect(createBrowserClient).toHaveBeenCalled();
    const call = vi.mocked(createBrowserClient).mock.calls[0];
    expect(call?.[2]).toMatchObject({
      cookieOptions: expect.objectContaining({
        path: "/",
        sameSite: "lax",
        domain: "club.example.org",
      }),
    });
  });

  it("uses undefined cookie domain for localhost app URL", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://localhost:3000");
    vi.resetModules();
    const { createBrowserClient } = await import("@supabase/ssr");
    vi.mocked(createBrowserClient).mockClear();
    const { createBrowserSupabaseClient } = await import(
      "@/lib/supabase/browser"
    );
    createBrowserSupabaseClient();
    const opts = vi.mocked(createBrowserClient).mock.calls[0]?.[2] as {
      cookieOptions: { domain?: string };
    };
    expect(opts.cookieOptions.domain).toBeUndefined();
  });
});
