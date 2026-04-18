import { compareYmd, getTodayYmdInTimezone } from "@/lib/datetime";
import type { FundraiserEventRow } from "@/lib/data/fundraiser";

/** Display deadline/pickup instants in this zone (Lewisport / chapter cooks are Central). */
export const FUNDRAISER_INSTANT_DISPLAY_TIMEZONE = "America/Chicago";

/** True after the order deadline instant (when set) or after orders_close_date (date-only). */
export function isOrderingDeadlinePassed(
  row: Pick<
    FundraiserEventRow,
    "orders_close_at" | "orders_close_date"
  >,
  nowMs: number,
  siteTimezone: string
): boolean {
  if (row.orders_close_at) {
    const t = new Date(row.orders_close_at).getTime();
    if (!Number.isNaN(t)) {
      return nowMs >= t;
    }
  }
  if (!row.orders_close_date) return true;
  const today = getTodayYmdInTimezone(siteTimezone);
  return compareYmd(today, row.orders_close_date) > 0;
}

/** True while online orders are still accepted for this row (ignores order_open — caller checks that). */
export function isWithinOrderWindow(
  row: Pick<
    FundraiserEventRow,
    "orders_close_at" | "orders_close_date"
  >,
  nowMs: number,
  siteTimezone: string
): boolean {
  return !isOrderingDeadlinePassed(row, nowMs, siteTimezone);
}

/** Pickup / cook calendar day not reached yet (no banner / no orders after this date). */
export function isBeforePickupDay(
  eventDate: string | null,
  siteTimezone: string
): boolean {
  if (!eventDate) return false;
  const today = getTodayYmdInTimezone(siteTimezone);
  return compareYmd(today, eventDate) < 0;
}
