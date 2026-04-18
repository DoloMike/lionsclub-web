import "server-only";

import { env } from "@/lib/env";
import { formatInstantInTimezone } from "@/lib/datetime";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type FundraiserOrderAdminRow = {
  id: string;
  quantity: number;
  unit_price_cents: number;
  total_cents: number;
  customer_name: string | null;
  customer_email: string;
  customer_phone: string | null;
  notes: string | null;
  status: string;
  stripe_checkout_session_id: string | null;
  created_at: string;
};

export type FundraiserEventAdminRow = {
  id: string;
  title: string;
  slug: string;
  event_date: string | null;
  price_cents_per_unit: number;
  inventory_units: number | null;
};

export type FundraiserStatsAggregates = {
  /** Rows counted toward sales (excludes cancelled). */
  orderCount: number;
  cancelledOrderCount: number;
  chickensSold: number;
  totalCents: number;
  /** null if no orders */
  averageOrderCents: number | null;
  /** null when inventory not capped */
  inventoryRemaining: number | null;
};

function isCountedForSales(status: string): boolean {
  return status !== "cancelled";
}

export function computeFundraiserAggregates(
  orders: Pick<FundraiserOrderAdminRow, "quantity" | "total_cents" | "status">[],
  inventoryUnits: number | null
): FundraiserStatsAggregates {
  const counted = orders.filter((o) => isCountedForSales(o.status));
  const cancelled = orders.filter((o) => o.status === "cancelled");

  const chickensSold = counted.reduce((s, o) => s + o.quantity, 0);
  const totalCents = counted.reduce((s, o) => s + o.total_cents, 0);

  let inventoryRemaining: number | null = null;
  if (inventoryUnits != null && inventoryUnits >= 0) {
    inventoryRemaining = Math.max(0, inventoryUnits - chickensSold);
  }

  return {
    orderCount: counted.length,
    cancelledOrderCount: cancelled.length,
    chickensSold,
    totalCents,
    averageOrderCents:
      counted.length > 0 ? Math.round(totalCents / counted.length) : null,
    inventoryRemaining,
  };
}

export async function getFundraiserEventForAdmin(
  eventId: string
): Promise<FundraiserEventAdminRow | null> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("fundraiser_events")
    .select(
      "id, title, slug, event_date, price_cents_per_unit, inventory_units"
    )
    .eq("id", eventId)
    .maybeSingle();

  if (error || !data) return null;
  return data as FundraiserEventAdminRow;
}

export async function getChickenOrdersForEventAdmin(
  eventId: string
): Promise<FundraiserOrderAdminRow[]> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("chicken_orders")
    .select(
      "id, quantity, unit_price_cents, total_cents, customer_name, customer_email, customer_phone, notes, status, stripe_checkout_session_id, created_at"
    )
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return data as FundraiserOrderAdminRow[];
}

export function formatOrderTimestampForCsv(iso: string): string {
  const s = formatInstantInTimezone(iso, env.siteTimezone);
  return s ?? iso;
}

function csvEscapeCell(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatMoney(cents: number): string {
  return (cents / 100).toFixed(2);
}

/**
 * RFC 4180-style CSV for chapter volunteers (opens cleanly in Excel / Sheets).
 */
export function buildChickenOrdersCsv(orders: FundraiserOrderAdminRow[]): string {
  const header = [
    "Customer name",
    "Email",
    "Phone",
    "Quantity (chickens)",
    "Unit price (USD)",
    "Line total (USD)",
    "Notes",
    "Status",
    "Placed at",
    "Stripe checkout session id",
  ];

  const lines = [header.join(",")];

  for (const o of orders) {
    const row = [
      o.customer_name ?? "",
      o.customer_email,
      o.customer_phone ?? "",
      String(o.quantity),
      formatMoney(o.unit_price_cents),
      formatMoney(o.total_cents),
      o.notes ?? "",
      o.status,
      formatOrderTimestampForCsv(o.created_at),
      o.stripe_checkout_session_id ?? "",
    ].map((cell) => csvEscapeCell(cell));
    lines.push(row.join(","));
  }

  return lines.join("\r\n") + "\r\n";
}
