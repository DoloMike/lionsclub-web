import { describe, expect, it } from "vitest";
import {
  buildChickenOrdersCsv,
  computeFundraiserAggregates,
  formatOrderTimestampForCsv,
  type FundraiserOrderAdminRow,
} from "@/lib/data/fundraiser-admin-stats";

describe("fundraiser-admin-stats", () => {
  describe("computeFundraiserAggregates", () => {
    it("aggregates paid orders and inventory", () => {
      const agg = computeFundraiserAggregates(
        [
          {
            quantity: 2,
            total_cents: 2600,
            status: "paid",
          },
          {
            quantity: 1,
            total_cents: 1300,
            status: "cancelled",
          },
        ],
        10
      );
      expect(agg.orderCount).toBe(1);
      expect(agg.cancelledOrderCount).toBe(1);
      expect(agg.chickensSold).toBe(2);
      expect(agg.totalCents).toBe(2600);
      expect(agg.averageOrderCents).toBe(2600);
      expect(agg.inventoryRemaining).toBe(8);
    });

    it("handles empty orders and null inventory", () => {
      const agg = computeFundraiserAggregates([], null);
      expect(agg.orderCount).toBe(0);
      expect(agg.averageOrderCents).toBeNull();
      expect(agg.inventoryRemaining).toBeNull();
    });
  });

  describe("formatOrderTimestampForCsv", () => {
    it("returns iso when format fails", () => {
      expect(formatOrderTimestampForCsv("not-iso")).toBe("not-iso");
    });
  });

  describe("buildChickenOrdersCsv", () => {
    const base: FundraiserOrderAdminRow = {
      id: "1",
      quantity: 1,
      unit_price_cents: 1300,
      total_cents: 1300,
      customer_name: "A",
      customer_email: "a@b.co",
      customer_phone: null,
      notes: null,
      status: "paid",
      stripe_checkout_session_id: null,
      created_at: "2026-01-01T12:00:00.000Z",
    };

    it("builds header and rows", () => {
      const csv = buildChickenOrdersCsv([base]);
      expect(csv).toContain("Customer name");
      expect(csv).toContain("a@b.co");
      expect(csv.endsWith("\r\n")).toBe(true);
    });

    it("escapes commas quotes and newlines in cells", () => {
      const row: FundraiserOrderAdminRow = {
        ...base,
        customer_name: 'Name "X"',
        notes: 'line1\nline2',
      };
      const csv = buildChickenOrdersCsv([row]);
      expect(csv).toContain('""');
    });
  });
});
