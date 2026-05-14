import type { User } from "@supabase/supabase-js";

/**
 * Friendly display name for a signed-in Supabase user.
 *
 * Mirrors the fallback chain used by `HeaderAuthControls.displayLabel` so the
 * name people see in the account menu, on volunteer sign-up sheets, and
 * anywhere else we surface "who's logged in" stays consistent.
 */
function readMetaString(
  meta: User["user_metadata"],
  key: string,
): string | undefined {
  const v = meta?.[key];
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

export function deriveDisplayName(user: User): string {
  const full =
    readMetaString(user.user_metadata, "full_name") ??
    readMetaString(user.user_metadata, "name");
  if (full) return full;
  const email = user.email;
  if (email) {
    const local = email.split("@")[0];
    if (local && local.trim()) return local;
    return email;
  }
  return "Lions volunteer";
}
