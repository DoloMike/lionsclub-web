import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/public-server", () => ({
  createPublicServerClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          gt: () => ({
            order: () =>
              Promise.resolve({
                data: null,
                error: { message: "db" },
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

describe("fundraiser data — query errors", () => {
  it("returns empty when Supabase returns an error", async () => {
    await expect(getOpenFundraiserEvents()).resolves.toEqual([]);
    const { acceptingOrders, closedBeforePickup } =
      await getFundraiserEventsForMarketingPage();
    expect(acceptingOrders).toEqual([]);
    expect(closedBeforePickup).toEqual([]);
  });
});
