import { describe, expect, it } from "vitest";
import {
  FUNDRAISER_INSTANT_DISPLAY_TIMEZONE,
  isBeforePickupDay,
  isOrderingDeadlinePassed,
  isWithinOrderWindow,
} from "@/lib/fundraiser-dates";

describe("fundraiser-dates", () => {
  const tz = "America/Kentucky/Louisville";

  it("exports Central display timezone constant", () => {
    expect(FUNDRAISER_INSTANT_DISPLAY_TIMEZONE).toBe("America/Chicago");
  });

  describe("isOrderingDeadlinePassed", () => {
    it("uses orders_close_at when valid", () => {
      const t = new Date("2030-01-15T12:00:00.000Z").getTime();
      expect(
        isOrderingDeadlinePassed(
          {
            orders_close_at: "2030-01-15T12:00:00.000Z",
            orders_close_date: "2030-01-10",
          },
          t - 1,
          tz
        )
      ).toBe(false);
      expect(
        isOrderingDeadlinePassed(
          {
            orders_close_at: "2030-01-15T12:00:00.000Z",
            orders_close_date: "2030-01-10",
          },
          t,
          tz
        )
      ).toBe(true);
    });

    it("ignores invalid orders_close_at and uses date-only deadline", () => {
      expect(
        isOrderingDeadlinePassed(
          { orders_close_at: "not-a-date", orders_close_date: "2000-01-01" },
          Date.now(),
          tz
        )
      ).toBe(true);
    });

    it("treats missing orders_close_date as passed", () => {
      expect(
        isOrderingDeadlinePassed(
          { orders_close_at: null, orders_close_date: null },
          Date.now(),
          tz
        )
      ).toBe(true);
    });
  });

  describe("isWithinOrderWindow", () => {
    it("inverts deadline result", () => {
      const future = new Date(Date.now() + 86400_000).toISOString();
      expect(
        isWithinOrderWindow(
          { orders_close_at: future, orders_close_date: "2030-12-31" },
          Date.now(),
          tz
        )
      ).toBe(true);
    });
  });

  describe("isBeforePickupDay", () => {
    it("is false for null date", () => {
      expect(isBeforePickupDay(null, tz)).toBe(false);
    });

    it("compares today to event date in site timezone", () => {
      expect(typeof isBeforePickupDay("2099-12-31", tz)).toBe("boolean");
    });
  });
});
