import "server-only";
import { isSupabaseConfigured } from "@/lib/env";
import { getSessionAdmin } from "@/lib/auth/get-session";

/**
 * Throws unless the current request is an authenticated admin. Delegates to
 * the request-level cached `getSessionAdmin` so a single page render that
 * runs multiple admin actions (or layout + action pair) reuses the same
 * `getUser()` + cached profile role lookup.
 */
export async function assertAdmin(): Promise<{ userId: string }> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured");
  }

  const user = await getSessionAdmin();
  if (!user) {
    throw new Error("Forbidden");
  }

  return { userId: user.id };
}
