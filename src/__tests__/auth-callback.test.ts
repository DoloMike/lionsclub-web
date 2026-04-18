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
    expect(res.headers.get("location")).toContain("/login");
  });

  it("redirects to next without exchange when there is no code", async () => {
    exchangeCodeForSession.mockClear();
    const req = new NextRequest(
      "https://localhost/auth/callback?next=/contact"
    );
    const res = await GET(req);
    expect(res.headers.get("location")).toContain("/contact");
    expect(exchangeCodeForSession).not.toHaveBeenCalled();
  });

  it("exchanges code and redirects to next without code in URL", async () => {
    const req = new NextRequest(
      "https://localhost/auth/callback?code=abc&next=/events"
    );
    const res = await GET(req);
    expect(exchangeCodeForSession).toHaveBeenCalledWith("abc");
    expect(res.status).toBe(307);
    const loc = res.headers.get("location")!;
    expect(loc).toContain("/events");
    expect(loc).not.toContain("code=");
  });

  it("redirects to login when exchange fails", async () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    exchangeCodeForSession.mockResolvedValue({
      error: new Error("bad"),
    });
    const req = new NextRequest("https://localhost/auth/callback?code=bad");
    const res = await GET(req);
    expect(res.headers.get("location")).toContain("/login?error=oauth");
    errSpy.mockRestore();
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
});
