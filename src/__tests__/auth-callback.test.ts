import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const exchangeCodeForSession = vi.fn().mockResolvedValue({ error: null });

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: { exchangeCodeForSession },
  })),
}));

import { GET } from "@/app/auth/callback/route";

describe("GET /auth/callback", () => {
  afterEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-anon-key");
    exchangeCodeForSession.mockResolvedValue({ error: null });
  });

  it("redirects to login on OAuth error param", async () => {
    const req = new NextRequest(
      "https://localhost/auth/callback?error=access_denied"
    );
    const res = await GET(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login?error=oauth");
  });

  it("redirects to / without code when no code param", async () => {
    exchangeCodeForSession.mockClear();
    const req = new NextRequest("https://localhost/auth/callback?next=/events");
    const res = await GET(req);
    expect(res.headers.get("location")).toContain("/events");
    expect(exchangeCodeForSession).not.toHaveBeenCalled();
  });

  it("exchanges code server-side and redirects without code in URL", async () => {
    const req = new NextRequest(
      "https://localhost/auth/callback?code=abc123&next=/events"
    );
    const res = await GET(req);
    expect(exchangeCodeForSession).toHaveBeenCalledWith("abc123");
    expect(res.status).toBe(307);
    const loc = res.headers.get("location")!;
    expect(loc).toContain("/events");
    expect(loc).not.toContain("code=");
  });

  it("redirects to login when exchange fails", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: new Error("bad") });
    const req = new NextRequest("https://localhost/auth/callback?code=bad");
    const res = await GET(req);
    expect(res.headers.get("location")).toContain("/login?error=oauth");
  });

  it("uses x-forwarded-host for redirect origin when present", async () => {
    const req = new NextRequest(
      "http://internal/auth/callback?code=ok&next=/",
      {
        headers: {
          "x-forwarded-host": "public.example.org",
          "x-forwarded-proto": "https",
        },
      }
    );
    const res = await GET(req);
    expect(res.headers.get("location")).toMatch(
      /^https:\/\/public\.example\.org\/$/
    );
  });

  it("redirects to / by default", async () => {
    const req = new NextRequest("https://localhost/auth/callback?code=abc");
    const res = await GET(req);
    expect(res.headers.get("location")).toMatch(/^https:\/\/localhost\/$/);
  });
});
