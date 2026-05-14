import { describe, expect, it } from "vitest";
import {
  formatShiftDateLabel,
  isValidVolunteerEventSlug,
  slugifyVolunteerEventTitle,
} from "@/lib/volunteer-signups";

describe("formatShiftDateLabel", () => {
  it("formats a YYYY-MM-DD date as a long en-US label", () => {
    expect(formatShiftDateLabel("2026-05-29")).toBe("Friday, May 29, 2026");
  });

  it("does not shift the day across timezones (parses as UTC parts)", () => {
    // Passing the string through `new Date(iso)` would parse it as UTC
    // midnight and the toLocaleDateString call would then shift it to the
    // server's local zone, potentially landing on the day before. The helper
    // builds a Date.UTC and formats in UTC so May 29 stays May 29 regardless
    // of where the server is.
    expect(formatShiftDateLabel("2026-01-01")).toBe(
      "Thursday, January 1, 2026",
    );
    expect(formatShiftDateLabel("2026-12-31")).toBe(
      "Thursday, December 31, 2026",
    );
  });

  it("returns the raw string when it cannot be parsed", () => {
    expect(formatShiftDateLabel("not-a-date")).toBe("not-a-date");
    expect(formatShiftDateLabel("")).toBe("");
  });
});

describe("isValidVolunteerEventSlug", () => {
  it("accepts lowercase alphanumerics with single dashes", () => {
    expect(isValidVolunteerEventSlug("heritage-festival-2027")).toBe(true);
    expect(isValidVolunteerEventSlug("a")).toBe(true);
    expect(isValidVolunteerEventSlug("a-b-c")).toBe(true);
  });

  it("rejects uppercase, spaces, underscores, and edge dashes", () => {
    expect(isValidVolunteerEventSlug("Heritage-Festival")).toBe(false);
    expect(isValidVolunteerEventSlug("heritage festival")).toBe(false);
    expect(isValidVolunteerEventSlug("heritage_festival")).toBe(false);
    expect(isValidVolunteerEventSlug("-leading")).toBe(false);
    expect(isValidVolunteerEventSlug("trailing-")).toBe(false);
    expect(isValidVolunteerEventSlug("double--dash")).toBe(false);
    expect(isValidVolunteerEventSlug("")).toBe(false);
  });
});

describe("slugifyVolunteerEventTitle", () => {
  it("normalizes mixed case + punctuation into a valid slug", () => {
    expect(slugifyVolunteerEventTitle("Heritage Festival 2027!")).toBe(
      "heritage-festival-2027",
    );
    expect(slugifyVolunteerEventTitle("  spring   parade ")).toBe(
      "spring-parade",
    );
    expect(slugifyVolunteerEventTitle("KidSight @ School")).toBe(
      "kidsight-school",
    );
  });

  it("falls back to 'event' when input is empty / only punctuation", () => {
    expect(slugifyVolunteerEventTitle("")).toBe("event");
    expect(slugifyVolunteerEventTitle("!!!")).toBe("event");
  });

  it("always returns a valid slug", () => {
    const inputs = [
      "Heritage Festival 2027!",
      "  spring   parade ",
      "KidSight @ School",
      "",
      "!!!",
      "Already-A-Slug",
    ];
    for (const input of inputs) {
      expect(isValidVolunteerEventSlug(slugifyVolunteerEventTitle(input))).toBe(
        true,
      );
    }
  });
});
