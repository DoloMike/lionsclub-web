import { describe, expect, it, vi } from "vitest";

const maybeSingle = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdmin: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle }),
      }),
    }),
  }),
}));

import { getCachedProfileRole } from "@/lib/data/profile";

describe("getCachedProfileRole", () => {
  it("returns the role from profiles", async () => {
    maybeSingle.mockResolvedValueOnce({ data: { role: "admin" } });
    await expect(getCachedProfileRole("u1")).resolves.toBe("admin");
  });

  it("falls back to guest when row is missing", async () => {
    maybeSingle.mockResolvedValueOnce({ data: null });
    await expect(getCachedProfileRole("u2")).resolves.toBe("guest");
  });
});
