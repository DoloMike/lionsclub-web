import { beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "@supabase/supabase-js";

const assertAdmin = vi.fn();
const findAuthUserByEmail = vi.fn();
const inviteUserByEmail = vi.fn();
const deleteUser = vi.fn();
const upsertProfile = vi.fn();
const updateTag = vi.fn();
const revalidatePath = vi.fn();

vi.mock("@/lib/auth/assert-admin", () => ({
  assertAdmin: () => assertAdmin(),
}));

vi.mock("@/lib/data/admin-users", () => ({
  findAuthUserByEmail: (...args: unknown[]) => findAuthUserByEmail(...args),
}));

vi.mock("@/lib/site-url", () => ({
  getPublicSiteUrl: () => "https://example.com",
}));

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdmin: () => ({
    auth: { admin: { inviteUserByEmail, deleteUser } },
    from: (table: string) => {
      if (table !== "profiles") throw new Error(`Unexpected table: ${table}`);
      return { upsert: upsertProfile };
    },
  }),
}));

vi.mock("next/cache", () => ({
  updateTag: (...args: unknown[]) => updateTag(...args),
  revalidatePath: (...args: unknown[]) => revalidatePath(...args),
}));

import { inviteAdmin } from "@/app/admin/(protected)/admins/actions";

const initialInviteAdminState = {
  status: "idle",
  message: "",
} as const;

function formData(email: string): FormData {
  const data = new FormData();
  data.set("email", email);
  return data;
}

function user(id: string, email: string): User {
  return {
    id,
    email,
    aud: "authenticated",
    role: "authenticated",
    app_metadata: {},
    user_metadata: {},
    created_at: "2026-01-01T00:00:00Z",
  } as User;
}

describe("inviteAdmin", () => {
  beforeEach(() => {
    assertAdmin.mockReset();
    findAuthUserByEmail.mockReset();
    inviteUserByEmail.mockReset();
    deleteUser.mockReset();
    upsertProfile.mockReset();
    updateTag.mockReset();
    revalidatePath.mockReset();
    assertAdmin.mockResolvedValue({ userId: "current-admin" });
  });

  it("validates the email after checking admin authorization", async () => {
    const result = await inviteAdmin(
      initialInviteAdminState,
      formData("not-an-email"),
    );

    expect(assertAdmin).toHaveBeenCalledOnce();
    expect(result).toEqual({
      status: "error",
      message: "Enter a valid email address.",
    });
    expect(findAuthUserByEmail).not.toHaveBeenCalled();
  });

  it("invites a new user, grants admin role, and refreshes the roster", async () => {
    const invited = user("new-admin", "new@example.com");
    findAuthUserByEmail.mockResolvedValueOnce(null);
    inviteUserByEmail.mockResolvedValueOnce({
      data: { user: invited },
      error: null,
    });
    upsertProfile.mockResolvedValueOnce({ error: null });

    const result = await inviteAdmin(
      initialInviteAdminState,
      formData(" New@Example.com "),
    );

    expect(inviteUserByEmail).toHaveBeenCalledWith("new@example.com", {
      redirectTo:
        "https://example.com/auth/invite?next=/admin/admins",
      data: { invited_as: "admin" },
    });
    expect(upsertProfile).toHaveBeenCalledWith(
      { id: "new-admin", role: "admin" },
      { onConflict: "id" },
    );
    expect(updateTag).toHaveBeenCalledWith("profile-role:new-admin");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/admins");
    expect(result.status).toBe("success");
    expect(result.message).toContain("Invitation sent");
  });

  it("promotes an existing account without sending another invitation", async () => {
    findAuthUserByEmail.mockResolvedValueOnce(
      user("existing-admin", "existing@example.com"),
    );
    upsertProfile.mockResolvedValueOnce({ error: null });

    const result = await inviteAdmin(
      initialInviteAdminState,
      formData("existing@example.com"),
    );

    expect(inviteUserByEmail).not.toHaveBeenCalled();
    expect(upsertProfile).toHaveBeenCalledWith(
      { id: "existing-admin", role: "admin" },
      { onConflict: "id" },
    );
    expect(result.message).toContain("already has an account");
  });

  it("removes a newly invited auth user if granting admin role fails", async () => {
    const invited = user("rollback-admin", "rollback@example.com");
    findAuthUserByEmail.mockResolvedValueOnce(null);
    inviteUserByEmail.mockResolvedValueOnce({
      data: { user: invited },
      error: null,
    });
    upsertProfile.mockResolvedValueOnce({
      error: { message: "database unavailable" },
    });
    deleteUser.mockResolvedValueOnce({ error: null });

    const result = await inviteAdmin(
      initialInviteAdminState,
      formData("rollback@example.com"),
    );

    expect(deleteUser).toHaveBeenCalledWith("rollback-admin");
    expect(result).toEqual({
      status: "error",
      message: "Could not grant admin access: database unavailable",
    });
    expect(updateTag).not.toHaveBeenCalled();
  });
});
