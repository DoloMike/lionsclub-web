import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { isSupabaseConfigured } from "@/lib/env";
import type { SessionProfile } from "@/lib/auth/session-profile";
import { getCachedProfileRole } from "@/lib/data/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export type { SessionProfile };

/**
 * Fast cookie-based check before constructing a Supabase server client.
 * Mirrors the proxy short-circuit so guests don't pay for `getUser()`
 * (network call to Supabase) or a profiles query on every page render.
 */
async function mayHaveSupabaseSession(): Promise<boolean> {
  const store = await cookies();
  return store.getAll().some(({ name }) => name.startsWith("sb-"));
}

export const getSessionProfile = cache(async (): Promise<SessionProfile | null> => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!(await mayHaveSupabaseSession())) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const role = await getCachedProfileRole(user.id);
  return { user, role };
});

export async function getSessionUser() {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!(await mayHaveSupabaseSession())) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getSessionAdmin() {
  const session = await getSessionProfile();
  if (!session || session.role !== "admin") return null;
  return session.user;
}
