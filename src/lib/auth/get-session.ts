import "server-only";
import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/env";
import type { SessionProfile } from "@/lib/auth/session-profile";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export type { SessionProfile };

export const getSessionProfile = cache(async (): Promise<SessionProfile | null> => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return { user, role: profile?.role ?? "guest" };
});

export async function getSessionUser() {
  if (!isSupabaseConfigured()) {
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
