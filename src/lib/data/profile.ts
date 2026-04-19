import "server-only";

import { unstable_cache } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/** Cache key + tag base. Per-user invalidation via `profile-role:<userId>`. */
const PROFILE_ROLE_TAG = "profile-role";

/**
 * Cached `profiles.role` for a user. Roles change rarely; the per-request
 * `react.cache` on `getSessionProfile` handles intra-render dedupe, and this
 * `unstable_cache` covers across-request dedupe so the row isn't re-read on
 * every signed-in page view.
 *
 * Invalidate with `updateTag(\`profile-role:${userId}\`)` when an admin
 * changes a user's role.
 */
export async function getCachedProfileRole(userId: string): Promise<string> {
  return unstable_cache(
    async (): Promise<string> => {
      const { data } = await getSupabaseAdmin()
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();
      return data?.role ?? "guest";
    },
    [PROFILE_ROLE_TAG, userId],
    { revalidate: 300, tags: [PROFILE_ROLE_TAG, `${PROFILE_ROLE_TAG}:${userId}`] }
  )();
}
