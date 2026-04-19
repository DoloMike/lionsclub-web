import "server-only";

import { unstable_cache } from "next/cache";
import type { SessionProfile } from "@/lib/auth/session-profile";
import { formatInstantInTimezone, getTodayYmdInTimezone } from "@/lib/datetime";
import { env } from "@/lib/env";
import { getPaidChickenOrderEventIdsForUser } from "@/lib/data/chicken-orders";
import {
  FUNDRAISER_INSTANT_DISPLAY_TIMEZONE,
  isBeforePickupDay,
  isOrderingDeadlinePassed,
} from "@/lib/fundraiser-dates";
import { createPublicServerClient } from "@/lib/supabase/public-server";

type Row = {
  id: string;
  title: string;
  event_date: string;
  orders_close_date: string;
  orders_close_at: string | null;
  pickup_starts_at: string | null;
  pickup_location: string | null;
};

export type FundraiserBannerSegment = {
  kind: "ordering" | "post_deadline";
  bannerKey: string;
  headline: string;
  summary: string;
  showOrderButton: boolean;
  /** Single-event segments: link to maps for pickup venue */
  pickupLocation?: string | null;
};

function formatLongDate(ymd: string): string {
  const d = new Date(`${ymd}T12:00:00`);
  if (Number.isNaN(d.getTime())) return ymd;
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function orderByLine(row: Row): string {
  if (row.orders_close_at) {
    const s = formatInstantInTimezone(
      row.orders_close_at,
      FUNDRAISER_INSTANT_DISPLAY_TIMEZONE
    );
    return s ? `Order by ${s}` : `Order by ${formatLongDate(row.orders_close_date)}`;
  }
  return `Order by end of ${formatLongDate(row.orders_close_date)}`;
}

function pickupLine(row: Row): string {
  if (row.pickup_starts_at) {
    const s = formatInstantInTimezone(
      row.pickup_starts_at,
      FUNDRAISER_INSTANT_DISPLAY_TIMEZONE
    );
    return s ? `Pickup ${s}` : `Pickup ${formatLongDate(row.event_date)}`;
  }
  return `Pickup ${formatLongDate(row.event_date)}`;
}

function buildOrderingSegment(rows: Row[]): FundraiserBannerSegment {
  const ids = [...rows].map((r) => r.id).sort().join("|");
  if (rows.length === 1) {
    const e = rows[0];
    const headline = `${e.title} — orders open`;
    const parts = [orderByLine(e), pickupLine(e)];
    return {
      kind: "ordering",
      bannerKey: `order:${ids}`,
      headline,
      summary: parts.join(" · "),
      showOrderButton: true,
      pickupLocation: e.pickup_location,
    };
  }
  const headline = "Chicken cook — orders open";
  const summary = rows
    .map((e) => {
      const pickup = pickupLine(e);
      return `${e.title} (${pickup})`;
    })
    .join(" · ");
  return {
    kind: "ordering",
    bannerKey: `order:${ids}`,
    headline,
    summary,
    showOrderButton: true,
  };
}

function buildPostDeadlineSegment(rows: Row[]): FundraiserBannerSegment {
  const ids = [...rows].map((r) => r.id).sort().join("|");
  if (rows.length === 1) {
    const e = rows[0];
    const due = e.orders_close_at
      ? formatInstantInTimezone(
          e.orders_close_at,
          FUNDRAISER_INSTANT_DISPLAY_TIMEZONE
        )
      : formatLongDate(e.orders_close_date);
    const pickup = pickupLine(e);
    return {
      kind: "post_deadline",
      bannerKey: `post:${ids}`,
      headline: `${e.title} — online ordering closed`,
      summary: `Orders closed${due ? ` after ${due}` : ""}. ${pickup}.`,
      showOrderButton: false,
      pickupLocation: e.pickup_location,
    };
  }
  return {
    kind: "post_deadline",
    bannerKey: `post:${ids}`,
    headline: "Chicken cook — ordering closed for these dates",
    summary: rows
      .map((e) => {
        const p = pickupLine(e);
        const d = e.orders_close_at
          ? formatInstantInTimezone(
              e.orders_close_at,
              FUNDRAISER_INSTANT_DISPLAY_TIMEZONE
            )
          : formatLongDate(e.orders_close_date);
        return `${e.title}: orders closed${d ? ` after ${d}` : ""}; ${p}`;
      })
      .join(" · "),
    showOrderButton: false,
  };
}

/**
 * Banner segments: ordering CTA while within the order window; informational after the
 * deadline until pickup day. Signed-in users who already have a paid order for an event
 * are not shown that event.
 */
const getCachedOpenFundraiserRows = unstable_cache(
  async (today: string): Promise<Row[]> => {
    const supabase = createPublicServerClient();
    if (!supabase) return [];

    const { data: rows, error } = await supabase
      .from("fundraiser_events")
      .select(
        "id, title, event_date, orders_close_date, orders_close_at, pickup_starts_at, pickup_location, order_open"
      )
      .eq("order_open", true)
      .gt("event_date", today);

    if (error || !rows?.length) return [];
    return rows as Row[];
  },
  ["fundraiser-banner-open-events"],
  { revalidate: 300, tags: ["fundraiser-banner"] }
);

export async function getFundraiserBannerSegments(
  session: SessionProfile | null
): Promise<FundraiserBannerSegment[]> {
  const tz = env.siteTimezone;
  const today = getTodayYmdInTimezone(tz);
  const nowMs = Date.now();

  const [rows, paidIds] = await Promise.all([
    getCachedOpenFundraiserRows(today),
    getPaidChickenOrderEventIdsForUser(
      session?.user.id,
      session?.user.email ?? undefined
    ),
  ]);

  if (!rows.length) return [];

  const ordering: Row[] = [];
  const postDeadline: Row[] = [];

  for (const row of rows) {
    if (!row.event_date || !row.orders_close_date) continue;
    if (paidIds.has(row.id)) continue;
    if (!isBeforePickupDay(row.event_date, tz)) continue;

    if (isOrderingDeadlinePassed(row, nowMs, tz)) {
      postDeadline.push(row as Row);
    } else {
      ordering.push(row as Row);
    }
  }

  const out: FundraiserBannerSegment[] = [];
  if (ordering.length > 0) out.push(buildOrderingSegment(ordering));
  if (postDeadline.length > 0) out.push(buildPostDeadlineSegment(postDeadline));
  return out;
}

/** Cached anonymous banner — keeps the root layout static-friendly between revalidations. */
const getCachedPublicFundraiserBannerSegmentsInner = unstable_cache(
  async () => getFundraiserBannerSegments(null),
  ["fundraiser-banner-public"],
  { revalidate: 60, tags: ["fundraiser-banner"] }
);

export async function getCachedPublicFundraiserBannerSegments(): Promise<
  FundraiserBannerSegment[]
> {
  return getCachedPublicFundraiserBannerSegmentsInner();
}
