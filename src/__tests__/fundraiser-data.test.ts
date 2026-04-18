import { describe, expect, it, vi } from "vitest";

const fundraiserRow = {
  id: "ev1",
  title: "Cook",
  slug: "cook",
  description: null,
  event_date: "2099-12-31",
  orders_close_date: "2099-12-01",
  orders_close_at: null,
  pickup_starts_at: null,
  pickup_location: null,
  pickup_notes: null,
  price_cents_per_unit: 1300,
  max_units_per_order: 20,
  inventory_units: 100,
  order_open: true,
};

vi.mock("@/lib/supabase/public-server", () => ({
  createPublicServerClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          gt: () => ({
            order: () =>
              Promise.resolve({
                data: [fundraiserRow],
                error: null,
              }),
          }),
        }),
      }),
    }),
  }),
}));

import {
  getFundraiserEventsForMarketingPage,
  getOpenFundraiserEvents,
} from "@/lib/data/fundraiser";

describe("fundraiser data", () => {
  it("getOpenFundraiserEvents returns array", async () => {
    const rows = await getOpenFundraiserEvents();
    expect(rows.length).toBeGreaterThanOrEqual(0);
  });

  it("getFundraiserEventsForMarketingPage returns buckets", async () => {
    const { acceptingOrders, closedBeforePickup } =
      await getFundraiserEventsForMarketingPage();
    expect(Array.isArray(acceptingOrders)).toBe(true);
    expect(Array.isArray(closedBeforePickup)).toBe(true);
  });
});
