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

import {
  getSessionAdmin,
  getSessionProfile,
  getSessionUser,
} from "@/lib/auth/get-session";
import { isSupabaseConfigured } from "@/lib/env";

describe("get-session", () => {
  it("getSessionProfile returns null when Supabase not configured", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValueOnce(false);
    await expect(getSessionProfile()).resolves.toBeNull();
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
  });

  it("getSessionUser returns null when Supabase not configured", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValueOnce(false);
    await expect(getSessionUser()).resolves.toBeNull();
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
  });

  it("getSessionProfile returns null when no user", async () => {
    getUser.mockResolvedValueOnce({ data: { user: null } });
    await expect(getSessionProfile()).resolves.toBeNull();
  });

  it("getSessionProfile defaults role to guest", async () => {
    getUser.mockResolvedValueOnce({
      data: { user: { id: "u1", email: "a@b.co" } },
    });
    maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    const s = await getSessionProfile();
    expect(s?.role).toBe("guest");
  });

  it("getSessionUser returns null when no user", async () => {
    getUser.mockResolvedValueOnce({ data: { user: null } });
    await expect(getSessionUser()).resolves.toBeNull();
  });

  it("getSessionAdmin returns user only for admin role", async () => {
    getUser.mockResolvedValue({
      data: { user: { id: "u1" } },
    });
    maybeSingle.mockResolvedValueOnce({ data: { role: "member" }, error: null });
    await expect(getSessionAdmin()).resolves.toBeNull();

    maybeSingle.mockResolvedValueOnce({ data: { role: "admin" }, error: null });
    const admin = await getSessionAdmin();
    expect(admin?.id).toBe("u1");
  });
});
