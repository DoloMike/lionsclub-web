import { describe, expect, it, vi } from "vitest";
import {
  compareYmd,
  formatInstantInTimezone,
  getTodayYmdInTimezone,
} from "@/lib/datetime";

describe("datetime", () => {
  describe("compareYmd", () => {
    it("compares YYYY-MM-DD strings", () => {
      expect(compareYmd("2026-01-01", "2026-01-02")).toBe(-1);
      expect(compareYmd("2026-02-01", "2026-01-02")).toBe(1);
      expect(compareYmd("2026-01-01", "2026-01-01")).toBe(0);
    });
  });

  describe("formatInstantInTimezone", () => {
    it("returns null for nullish or invalid", () => {
      expect(formatInstantInTimezone(null, "UTC")).toBeNull();
      expect(formatInstantInTimezone(undefined, "UTC")).toBeNull();
      expect(formatInstantInTimezone("invalid", "UTC")).toBeNull();
    });

    it("formats a valid ISO instant", () => {
      const s = formatInstantInTimezone(
        "2026-04-18T17:00:00.000Z",
        "America/Chicago"
      );
      expect(s).toBeTruthy();
      expect(s).toContain("2026");
    });
  });

  describe("getTodayYmdInTimezone", () => {
    it("returns YYYY-MM-DD", () => {
      const ymd = getTodayYmdInTimezone("America/Kentucky/Louisville");
      expect(ymd).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("falls back when format parts are incomplete", () => {
      const spy = vi.spyOn(Intl, "DateTimeFormat").mockImplementation(
        () =>
          ({
            formatToParts: () => [{ type: "year", value: "2030" }],
          }) as unknown as Intl.DateTimeFormat
      );
      const ymd = getTodayYmdInTimezone("UTC");
      expect(ymd).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      spy.mockRestore();
    });
  });
});
