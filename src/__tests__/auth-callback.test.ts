import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { GET } from "@/app/auth/callback/route";

describe("GET /auth/callback", () => {
  it("redirects to login on OAuth error param", async () => {
    const req = new NextRequest(
      "https://localhost/auth/callback?error=access_denied"
    );
    const res = await GET(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login?error=oauth");
  });

  it("redirects to / by default, preserving code param for browser exchange", async () => {
    const req = new NextRequest(
      "https://localhost/auth/callback?code=abc123&state=xyz"
    );
    const res = await GET(req);
    expect(res.status).toBe(307);
    const loc = res.headers.get("location")!;
    expect(loc).toContain("code=abc123");
    expect(loc).toContain("state=xyz");
    expect(loc).toMatch(/^https:\/\/localhost\//);
  });

  it("respects the next param", async () => {
    const req = new NextRequest(
      "https://localhost/auth/callback?code=abc&next=/events"
    );
    const res = await GET(req);
    const loc = res.headers.get("location")!;
    expect(loc).toContain("/events");
    expect(loc).toContain("code=abc");
    expect(loc).not.toContain("next=");
  });

  it("ignores unsafe next values", async () => {
    const req = new NextRequest(
      "https://localhost/auth/callback?code=abc&next=//evil.com"
    );
    const res = await GET(req);
    const loc = res.headers.get("location")!;
    expect(loc).not.toContain("evil.com");
    expect(loc).toMatch(/^https:\/\/localhost\//);
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
      /^https:\/\/public\.example\.org\//
    );
  });
});
