import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";

/** Paid orders for this user (by `user_id` or `customer_email`) — for banner suppression. */
export async function getPaidChickenOrderEventIdsForUser(
  userId: string | undefined,
  email: string | undefined
): Promise<Set<string>> {
  if (!userId && !email) {
    return new Set();
  }

  const admin = getSupabaseAdmin();
  const ids = new Set<string>();

  if (userId) {
    const { data } = await admin
      .from("chicken_orders")
      .select("event_id")
      .eq("status", "paid")
      .eq("user_id", userId);
    for (const row of data ?? []) {
      if (row.event_id) ids.add(row.event_id);
    }
  }

  if (email) {
    const normalized = email.trim().toLowerCase();
    const { data } = await admin
      .from("chicken_orders")
      .select("event_id")
      .eq("status", "paid")
      .eq("customer_email", normalized);
    for (const row of data ?? []) {
      if (row.event_id) ids.add(row.event_id);
    }
  }

  return ids;
}
