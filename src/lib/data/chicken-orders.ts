import "server-only";

import { unstable_cache } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const fetchPaidChickenEventIds = unstable_cache(
  async (userIdKey: string, emailKey: string): Promise<string[]> => {
    const admin = getSupabaseAdmin();
    const ids = new Set<string>();

    if (userIdKey) {
      const { data } = await admin
        .from("chicken_orders")
        .select("event_id")
        .eq("status", "paid")
        .eq("user_id", userIdKey);
      for (const row of data ?? []) {
        if (row.event_id) ids.add(row.event_id);
      }
    }

    if (emailKey) {
      const { data } = await admin
        .from("chicken_orders")
        .select("event_id")
        .eq("status", "paid")
        .eq("customer_email", emailKey);
      for (const row of data ?? []) {
        if (row.event_id) ids.add(row.event_id);
      }
    }

    return [...ids].sort();
  },
  ["paid-chicken-event-ids"],
  { revalidate: 60 }
);

/** Paid orders for this user (by `user_id` or `customer_email`) — for banner suppression. */
export async function getPaidChickenOrderEventIdsForUser(
  userId: string | undefined,
  email: string | undefined
): Promise<Set<string>> {
  if (!userId && !email) {
    return new Set();
  }

  const userIdKey = userId ?? "";
  const emailKey = email?.trim().toLowerCase() ?? "";

  const ids = await fetchPaidChickenEventIds(userIdKey, emailKey);
  return new Set(ids);
}
