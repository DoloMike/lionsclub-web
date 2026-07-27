import "server-only";

import type { SupabaseClient, User } from "@supabase/supabase-js";
import { deriveDisplayName } from "@/lib/auth/display-name";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type AdminUserSummary = {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
  invitedAt: string | null;
  lastSignInAt: string | null;
};

type AdminProfileRow = {
  id: string;
  created_at: string;
};

export async function getAdminUsers(): Promise<AdminUserSummary[]> {
  const supabase = getSupabaseAdmin();
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, created_at")
    .eq("role", "admin")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Could not load admin profiles: ${error.message}`);
  }

  const admins = await Promise.all(
    ((profiles ?? []) as AdminProfileRow[]).map(async (profile) => {
      const { data, error: userError } =
        await supabase.auth.admin.getUserById(profile.id);

      if (userError || !data.user) {
        throw new Error(
          `Could not load admin user ${profile.id}: ${userError?.message ?? "User not found"}`,
        );
      }

      const user = data.user;
      return {
        id: user.id,
        email: user.email ?? "Email unavailable",
        displayName: deriveDisplayName(user),
        createdAt: profile.created_at,
        invitedAt: user.invited_at ?? null,
        lastSignInAt: user.last_sign_in_at ?? null,
      };
    }),
  );

  return admins.sort((a, b) => a.email.localeCompare(b.email));
}

/** Find an Auth user by email without assuming the project fits on one page. */
export async function findAuthUserByEmail(
  email: string,
  supabase: SupabaseClient = getSupabaseAdmin(),
): Promise<User | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const perPage = 1000;

  for (let page = 1; page <= 100; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw new Error(`Could not search existing users: ${error.message}`);
    }

    const match = data.users.find(
      (user) => user.email?.trim().toLowerCase() === normalizedEmail,
    );
    if (match) return match;
    if (data.users.length < perPage) return null;
  }

  throw new Error("Could not finish searching existing users");
}
