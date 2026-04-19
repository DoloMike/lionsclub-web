import { describe, expect, it, vi } from "vitest";

const getUser = vi.fn();
const getAll = vi.fn(() => [{ name: "sb-test-auth-token", value: "1" }]);

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ getAll })),
}));

vi.mock("@/lib/env", () => ({
  isSupabaseConfigured: vi.fn(() => true),
}));

vi.mock("@/lib/supabase/server-client", () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    auth: { getUser },
  })),
}));

const getCachedProfileRole = vi.fn();
vi.mock("@/lib/data/profile", () => ({
  getCachedProfileRole: (id: string) => getCachedProfileRole(id),
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

  it("getSessionProfile returns null when no sb-* cookie", async () => {
    getAll.mockReturnValueOnce([{ name: "other", value: "x" }]);
    await expect(getSessionProfile()).resolves.toBeNull();
    expect(getUser).not.toHaveBeenCalled();
  });

  it("getSessionUser returns null when Supabase not configured", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValueOnce(false);
    await expect(getSessionUser()).resolves.toBeNull();
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
  });

  it("getSessionUser returns null when no sb-* cookie", async () => {
    getAll.mockReturnValueOnce([]);
    await expect(getSessionUser()).resolves.toBeNull();
  });

  it("getSessionProfile returns null when no user", async () => {
    getUser.mockResolvedValueOnce({ data: { user: null } });
    await expect(getSessionProfile()).resolves.toBeNull();
  });

  it("getSessionProfile resolves role from cached profile lookup", async () => {
    getUser.mockResolvedValueOnce({
      data: { user: { id: "u1", email: "a@b.co" } },
    });
    getCachedProfileRole.mockResolvedValueOnce("guest");
    const s = await getSessionProfile();
    expect(s?.role).toBe("guest");
    expect(getCachedProfileRole).toHaveBeenCalledWith("u1");
  });

  it("getSessionUser returns null when no user", async () => {
    getUser.mockResolvedValueOnce({ data: { user: null } });
    await expect(getSessionUser()).resolves.toBeNull();
  });

  it("getSessionAdmin returns user only for admin role", async () => {
    getUser.mockResolvedValue({
      data: { user: { id: "u1" } },
    });
    getCachedProfileRole.mockResolvedValueOnce("member");
    await expect(getSessionAdmin()).resolves.toBeNull();

    getCachedProfileRole.mockResolvedValueOnce("admin");
    const admin = await getSessionAdmin();
    expect(admin?.id).toBe("u1");
  });
});
