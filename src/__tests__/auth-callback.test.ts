import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const exchangeCodeForSession = vi.fn().mockResolvedValue({ error: null });
const getUser = vi.fn().mockResolvedValue({ data: { user: null } });

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: { exchangeCodeForSession, getUser },
  })),
}));

import { GET } from "@/app/auth/callback/route";

describe("GET /auth/callback", () => {
  afterEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-anon-key");
    exchangeCodeForSession.mockResolvedValue({ error: null });
    getUser.mockResolvedValue({ data: { user: null } });
  });

  it("redirects to login on OAuth error when no session", async () => {
    const req = new NextRequest(
      "https://localhost/auth/callback?error=access_denied"
    );
    const res = await GET(req);
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toContain("/login?error=oauth");
  });

  it("redirects to /auth/complete with next when code param is missing", async () => {
    exchangeCodeForSession.mockClear();
    const req = new NextRequest("https://localhost/auth/callback?next=/events");
    const res = await GET(req);
    const loc = res.headers.get("location")!;
    expect(loc).toContain("/auth/complete");
    expect(loc).toContain("next=%2Fevents");
    expect(exchangeCodeForSession).not.toHaveBeenCalled();
  });

  it("exchanges code server-side and redirects to /auth/complete", async () => {
    const req = new NextRequest(
      "https://localhost/auth/callback?code=abc123&next=/events"
    );
    const res = await GET(req);
    expect(exchangeCodeForSession).toHaveBeenCalledWith("abc123");
    expect(res.status).toBe(303);
    const loc = res.headers.get("location")!;
    expect(loc).toContain("/auth/complete");
    expect(loc).not.toContain("code=");
    expect(loc).toContain("next=%2Fevents");
  });

  it("redirects to login when exchange fails and no session", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: new Error("bad") });
    const req = new NextRequest("https://localhost/auth/callback?code=bad");
    const res = await GET(req);
    expect(res.headers.get("location")).toContain("/login?error=oauth");
  });

  it("redirects to /auth/complete when exchange fails but user has session", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: new Error("bad") });
    getUser.mockResolvedValueOnce({
      data: { user: { id: "u1", email: "a@b.co" } },
    });
    const req = new NextRequest(
      "https://localhost/auth/callback?code=bad&next=/admin"
    );
    const res = await GET(req);
    const loc = res.headers.get("location")!;
    expect(loc).toContain("/auth/complete");
    expect(loc).toContain("next=%2Fadmin");
  });

  it("redirects to /auth/complete on oauth error when user already signed in", async () => {
    getUser.mockResolvedValueOnce({
      data: { user: { id: "u1" } },
    });
    const req = new NextRequest(
      "https://localhost/auth/callback?error=bad_oauth_state&next=/events"
    );
    const res = await GET(req);
    const loc = res.headers.get("location")!;
    expect(loc).toContain("/auth/complete");
    expect(loc).toContain("next=%2Fevents");
    expect(loc).not.toContain("/login");
  });

  it("uses x-forwarded-host for redirect origin when present", async () => {
    const req = new NextRequest(
      "https://internal.example.com/auth/callback?code=ok&next=/admin",
      {
        headers: new Headers({
          "x-forwarded-host": "public.example.org",
          "x-forwarded-proto": "https",
        }),
      }
    );
    const res = await GET(req);
    const loc = res.headers.get("location")!;
    expect(loc).toContain("public.example.org");
    expect(loc).toContain("/auth/complete");
    expect(loc).toContain("next=%2Fadmin");
  });

  it("redirects to /auth/complete with safe next defaulting to /", async () => {
    const req = new NextRequest("https://localhost/auth/callback?code=abc");
    const res = await GET(req);
    const loc = res.headers.get("location")!;
    expect(loc).toBe("https://localhost/auth/complete");
  });
});
