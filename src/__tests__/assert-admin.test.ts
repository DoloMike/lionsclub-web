import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  isSupabaseConfigured: vi.fn(() => true),
}));

const getSessionAdmin = vi.fn();
vi.mock("@/lib/auth/get-session", () => ({
  getSessionAdmin: () => getSessionAdmin(),
}));

import { assertAdmin } from "@/lib/auth/assert-admin";
import { isSupabaseConfigured } from "@/lib/env";

describe("assertAdmin", () => {
  it("throws when Supabase not configured", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValueOnce(false);
    await expect(assertAdmin()).rejects.toThrow("Supabase is not configured");
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
  });

  it("throws when not admin", async () => {
    getSessionAdmin.mockResolvedValueOnce(null);
    await expect(assertAdmin()).rejects.toThrow("Forbidden");
  });

  it("returns userId for admin", async () => {
    getSessionAdmin.mockResolvedValueOnce({ id: "u1" });
    await expect(assertAdmin()).resolves.toEqual({ userId: "u1" });
  });
});
