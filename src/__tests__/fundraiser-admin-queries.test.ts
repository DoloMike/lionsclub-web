import { describe, expect, it, vi } from "vitest";

const maybeSingle = vi.fn();
const order = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdmin: () => ({
    from: (table: string) => {
      if (table === "fundraiser_events") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle,
            }),
          }),
        };
      }
      return {
        select: () => ({
          eq: () => ({
            order: () => order(),
          }),
        }),
      };
    },
  }),
}));

import {
  getChickenOrdersForEventAdmin,
  getFundraiserEventForAdmin,
} from "@/lib/data/fundraiser-admin-stats";

describe("fundraiser-admin-stats queries", () => {
  it("getFundraiserEventForAdmin returns null on error", async () => {
    maybeSingle.mockResolvedValueOnce({ data: null, error: new Error("x") });
    await expect(getFundraiserEventForAdmin("e1")).resolves.toBeNull();
  });

  it("getFundraiserEventForAdmin returns row", async () => {
    maybeSingle.mockResolvedValueOnce({
      data: {
        id: "e1",
        title: "T",
        slug: "t",
        event_date: "2026-01-01",
        price_cents_per_unit: 1300,
        inventory_units: 10,
      },
      error: null,
    });
    const ev = await getFundraiserEventForAdmin("e1");
    expect(ev?.slug).toBe("t");
  });

  it("getChickenOrdersForEventAdmin returns empty on error", async () => {
    order.mockResolvedValueOnce({ data: null, error: new Error("x") });
    await expect(getChickenOrdersForEventAdmin("e1")).resolves.toEqual([]);
  });
});
