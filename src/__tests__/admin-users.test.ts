import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient, User } from "@supabase/supabase-js";

const profileOrder = vi.fn();
const getUserById = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdmin: () => ({
    from: (table: string) => {
      if (table !== "profiles") throw new Error(`Unexpected table: ${table}`);
      return {
        select: () => ({
          eq: () => ({
            order: () => profileOrder(),
          }),
        }),
      };
    },
    auth: { admin: { getUserById } },
  }),
}));

import {
  findAuthUserByEmail,
  getAdminUsers,
} from "@/lib/data/admin-users";

function buildUser(overrides: Partial<User>): User {
  return {
    id: "user-1",
    aud: "authenticated",
    role: "authenticated",
    app_metadata: {},
    user_metadata: {},
    created_at: "2026-01-01T00:00:00Z",
    ...overrides,
  } as User;
}

describe("admin users", () => {
  it("loads auth details for admin profiles and sorts them by email", async () => {
    profileOrder.mockResolvedValueOnce({
      data: [
        { id: "user-b", created_at: "2026-02-01T00:00:00Z" },
        { id: "user-a", created_at: "2026-01-01T00:00:00Z" },
      ],
      error: null,
    });
    getUserById.mockImplementation(async (id: string) => ({
      data: {
        user:
          id === "user-a"
            ? buildUser({
                id,
                email: "alice@example.com",
                user_metadata: { full_name: "Alice Admin" },
                last_sign_in_at: "2026-01-02T00:00:00Z",
              })
            : buildUser({
                id,
                email: "zoe@example.com",
                invited_at: "2026-02-01T00:00:00Z",
              }),
      },
      error: null,
    }));

    await expect(getAdminUsers()).resolves.toEqual([
      {
        id: "user-a",
        email: "alice@example.com",
        displayName: "Alice Admin",
        createdAt: "2026-01-01T00:00:00Z",
        invitedAt: null,
        lastSignInAt: "2026-01-02T00:00:00Z",
      },
      {
        id: "user-b",
        email: "zoe@example.com",
        displayName: "zoe",
        createdAt: "2026-02-01T00:00:00Z",
        invitedAt: "2026-02-01T00:00:00Z",
        lastSignInAt: null,
      },
    ]);
  });

  it("finds an auth user by normalized email across pages", async () => {
    const firstPage = Array.from({ length: 1000 }, (_, index) =>
      buildUser({ id: `user-${index}`, email: `user-${index}@example.com` }),
    );
    const match = buildUser({ id: "match", email: "Admin@Example.com" });
    const listUsers = vi
      .fn()
      .mockResolvedValueOnce({ data: { users: firstPage }, error: null })
      .mockResolvedValueOnce({ data: { users: [match] }, error: null });
    const client = {
      auth: { admin: { listUsers } },
    } as unknown as SupabaseClient;

    await expect(
      findAuthUserByEmail(" admin@example.com ", client),
    ).resolves.toEqual(match);
    expect(listUsers).toHaveBeenNthCalledWith(1, { page: 1, perPage: 1000 });
    expect(listUsers).toHaveBeenNthCalledWith(2, { page: 2, perPage: 1000 });
  });

  it("returns null after the final auth-user page", async () => {
    const listUsers = vi.fn().mockResolvedValue({
      data: { users: [buildUser({ email: "other@example.com" })] },
      error: null,
    });
    const client = {
      auth: { admin: { listUsers } },
    } as unknown as SupabaseClient;

    await expect(
      findAuthUserByEmail("missing@example.com", client),
    ).resolves.toBeNull();
    expect(listUsers).toHaveBeenCalledTimes(1);
  });
});
