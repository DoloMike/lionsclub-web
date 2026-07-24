import { describe, expect, it } from "vitest";
import {
  HANCOCK_COUNTY_FAIR_SIGNUP_ROWS,
  HANCOCK_COUNTY_FAIR_SIGNUP_TIME_LABEL,
} from "@/lib/hancock-county-fair-signups";

describe("hancock county fair signups config", () => {
  it("includes the expected fair gate and Lions Booth signup rows", () => {
    expect(HANCOCK_COUNTY_FAIR_SIGNUP_ROWS).toEqual([
      {
        key: "fair-gate-thursday",
        title: "Fair Gate",
        label: "Thursday, August 6, 2026",
        timeLabel: HANCOCK_COUNTY_FAIR_SIGNUP_TIME_LABEL,
        maxSignups: 6,
      },
      {
        key: "fair-gate-friday",
        title: "Fair Gate",
        label: "Friday, August 7, 2026",
        timeLabel: HANCOCK_COUNTY_FAIR_SIGNUP_TIME_LABEL,
        maxSignups: 6,
      },
      {
        key: "lions-booth-thursday",
        title: "Lions Booth",
        label: "Thursday, August 6, 2026",
        timeLabel: HANCOCK_COUNTY_FAIR_SIGNUP_TIME_LABEL,
        maxSignups: 6,
      },
      {
        key: "lions-booth-friday",
        title: "Lions Booth",
        label: "Friday, August 7, 2026",
        timeLabel: HANCOCK_COUNTY_FAIR_SIGNUP_TIME_LABEL,
        maxSignups: 6,
      },
      {
        key: "lions-booth-saturday",
        title: "Lions Booth",
        label: "Saturday, August 8, 2026",
        timeLabel: HANCOCK_COUNTY_FAIR_SIGNUP_TIME_LABEL,
        maxSignups: 6,
      },
    ]);
  });
});
