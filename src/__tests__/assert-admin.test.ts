import { describe, expect, it, vi } from "vitest";

const getUser = vi.fn();
const maybeSingle = vi.fn();

vi.mock("@/lib/env", () => ({
  isSupabaseConfigured: vi.fn(() => true),
}));

vi.mock("@/lib/supabase/server-client", () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    auth: { getUser },
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle,
        }),
      }),
    }),
  })),
}));

import { assertAdmin } from "@/lib/auth/assert-admin";

describe("assertAdmin", () => {
  it("throws when Supabase not configured", async () => {
    const { isSupabaseConfigured } = await import("@/lib/env");
    vi.mocked(isSupabaseConfigured).mockReturnValueOnce(false);
    await expect(assertAdmin()).rejects.toThrow("Supabase is not configured");
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
  });

  it("throws when not signed in", async () => {
    getUser.mockResolvedValueOnce({ data: { user: null } });
    await expect(assertAdmin()).rejects.toThrow("Unauthorized");
  });

  it("throws when profile is not admin", async () => {
    getUser.mockResolvedValueOnce({ data: { user: { id: "u1" } } });
    maybeSingle.mockResolvedValueOnce({ data: { role: "member" }, error: null });
    await expect(assertAdmin()).rejects.toThrow("Forbidden");
  });

  it("returns userId for admin", async () => {
    getUser.mockResolvedValueOnce({ data: { user: { id: "u1" } } });
    maybeSingle.mockResolvedValueOnce({ data: { role: "admin" }, error: null });
    await expect(assertAdmin()).resolves.toEqual({ userId: "u1" });
  });

  it("throws when profile query errors", async () => {
    getUser.mockResolvedValueOnce({ data: { user: { id: "u1" } } });
    maybeSingle.mockResolvedValueOnce({ data: null, error: new Error("db") });
    await expect(assertAdmin()).rejects.toThrow("Forbidden");
  });
});
