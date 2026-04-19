import "server-only";

import { unstable_cache } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const fetchPaidChickenEventIds = unstable_cache(
  async (userIdKey: string, emailKey: string): Promise<string[]> => {
    const admin = getSupabaseAdmin();
    const filters: string[] = [];
    if (userIdKey) filters.push(`user_id.eq.${userIdKey}`);
    if (emailKey) filters.push(`customer_email.eq.${emailKey}`);
    if (filters.length === 0) return [];

    const { data } = await admin
      .from("chicken_orders")
      .select("event_id")
      .eq("status", "paid")
      .or(filters.join(","));

    const ids = new Set<string>();
    for (const row of data ?? []) {
      if (row.event_id) ids.add(row.event_id);
    }
    return [...ids].sort();
  },
  ["paid-chicken-event-ids"],
  { revalidate: 60, tags: ["chicken-orders"] }
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
