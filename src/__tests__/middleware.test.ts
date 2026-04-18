import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const getUser = vi.fn().mockResolvedValue({ data: { user: null } });

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser },
  })),
}));

import { middleware } from "@/middleware";

describe("middleware", () => {
  afterEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-anon-key");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://localhost:3000");
  });

  it("passes through when Supabase URL is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    const req = new NextRequest("https://example.com/about");
    const res = await middleware(req);
    expect(res.status).toBe(200);
  });

  it("refreshes session when Supabase is configured", async () => {
    const req = new NextRequest("https://example.com/about");
    const res = await middleware(req);
    expect(res.status).toBe(200);
    expect(getUser).toHaveBeenCalled();
  });
});
