import "server-only";
import { getTodayYmdInTimezone } from "@/lib/datetime";
import { env } from "@/lib/env";
import {
  isBeforePickupDay,
  isOrderingDeadlinePassed,
} from "@/lib/fundraiser-dates";
import { createPublicServerClient } from "@/lib/supabase/public-server";

export type FundraiserEventRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  event_date: string | null;
  /** Last calendar day to order (display / fallback). */
  orders_close_date: string | null;
  /** Exact order deadline (Central stored as timestamptz). When set, overrides date-only logic. */
  orders_close_at: string | null;
  /** Pickup window start (e.g. noon on cook day). */
  pickup_starts_at: string | null;
  pickup_location: string | null;
  pickup_notes: string | null;
  price_cents_per_unit: number;
  max_units_per_order: number;
  inventory_units: number | null;
  order_open: boolean;
};

/**
 * Fundraisers the public can still place orders for: ordering open, before pickup,
 * and on or before the order deadline (site timezone).
 */
export async function getOpenFundraiserEvents(): Promise<FundraiserEventRow[]> {
  const supabase = createPublicServerClient();
  if (!supabase) return [];

  const tz = env.siteTimezone;
  const today = getTodayYmdInTimezone(tz);
  const nowMs = Date.now();

  const { data, error } = await supabase
    .from("fundraiser_events")
    .select(
      "id, title, slug, description, event_date, orders_close_date, orders_close_at, pickup_starts_at, pickup_location, pickup_notes, price_cents_per_unit, max_units_per_order, inventory_units, order_open"
    )
    .eq("order_open", true)
    .gt("event_date", today)
    .order("event_date", { ascending: true });

  if (error || !data) return [];

  return data.filter((row) => {
    if (!row.event_date || !isBeforePickupDay(row.event_date, tz)) return false;
    return !isOrderingDeadlinePassed(row, nowMs, tz);
  });
}

/** For /fundraising: still accepting orders vs deadline passed but pickup not yet. */
export async function getFundraiserEventsForMarketingPage(): Promise<{
  acceptingOrders: FundraiserEventRow[];
  closedBeforePickup: FundraiserEventRow[];
}> {
  const supabase = createPublicServerClient();
  if (!supabase) {
    return { acceptingOrders: [], closedBeforePickup: [] };
  }

  const tz = env.siteTimezone;
  const today = getTodayYmdInTimezone(tz);
  const nowMs = Date.now();

  const { data, error } = await supabase
    .from("fundraiser_events")
    .select(
      "id, title, slug, description, event_date, orders_close_date, orders_close_at, pickup_starts_at, pickup_location, pickup_notes, price_cents_per_unit, max_units_per_order, inventory_units, order_open"
    )
    .eq("order_open", true)
    .gt("event_date", today)
    .order("event_date", { ascending: true });

  if (error || !data) {
    return { acceptingOrders: [], closedBeforePickup: [] };
  }

  const acceptingOrders: FundraiserEventRow[] = [];
  const closedBeforePickup: FundraiserEventRow[] = [];

  for (const row of data) {
    if (!row.event_date || !row.orders_close_date) continue;
    if (!isBeforePickupDay(row.event_date, tz)) continue;
    if (isOrderingDeadlinePassed(row, nowMs, tz)) {
      closedBeforePickup.push(row as FundraiserEventRow);
    } else {
      acceptingOrders.push(row as FundraiserEventRow);
    }
  }

  return { acceptingOrders, closedBeforePickup };
}
