import { describe, expect, it } from "vitest";
import {
  HERITAGE_FESTIVAL_SIGNUP_DAYS,
  HERITAGE_FESTIVAL_SIGNUP_CLOSE_TIME_LABEL,
} from "@/lib/heritage-festival-signups";

describe("heritage festival signups config", () => {
  it("includes booth setup and booth tear down rows", () => {
    expect(HERITAGE_FESTIVAL_SIGNUP_DAYS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          date: "2026-05-26",
          title: "Booth Setup",
          label: "Tuesday, May 26, 2026",
          timeLabel: "5:00 PM - 7:00 PM",
        }),
        expect.objectContaining({
          date: "2026-05-31",
          title: "Booth Tear Down",
          label: "Sunday, May 31, 2026",
          timeLabel: "1:00 PM - 3:00 PM",
        }),
      ]),
    );
  });

  it("keeps festival day close time for the main event days", () => {
    const festivalDays = HERITAGE_FESTIVAL_SIGNUP_DAYS.filter((day) =>
      ["2026-05-28", "2026-05-29", "2026-05-30"].includes(day.date),
    );

    expect(festivalDays).toHaveLength(3);
    expect(festivalDays.every((day) => day.timeLabel === HERITAGE_FESTIVAL_SIGNUP_CLOSE_TIME_LABEL)).toBe(true);
  });
});
