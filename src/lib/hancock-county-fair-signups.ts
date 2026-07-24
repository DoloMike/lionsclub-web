export const HANCOCK_COUNTY_FAIR_SIGNUP_TIME_LABEL = "5:00 PM - close";

export const HANCOCK_COUNTY_FAIR_SIGNUP_ROWS = [
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
] as const;

export type HancockCountyFairSignupKey =
  (typeof HANCOCK_COUNTY_FAIR_SIGNUP_ROWS)[number]["key"];

export type HancockCountyFairSignupRow = {
  id: string;
  name: string;
};

export type HancockCountyFairSignupSheetRow = {
  key: HancockCountyFairSignupKey;
  title: string;
  label: string;
  timeLabel: string;
  maxSignups: number;
  signups: HancockCountyFairSignupRow[];
};

const HANCOCK_COUNTY_FAIR_SIGNUP_KEY_SET = new Set<HancockCountyFairSignupKey>(
  HANCOCK_COUNTY_FAIR_SIGNUP_ROWS.map((row) => row.key),
);

export function isHancockCountyFairSignupKey(
  value: string,
): value is HancockCountyFairSignupKey {
  return HANCOCK_COUNTY_FAIR_SIGNUP_KEY_SET.has(value as HancockCountyFairSignupKey);
}

export function getHancockCountyFairSignupRow(
  value: HancockCountyFairSignupKey,
) {
  return HANCOCK_COUNTY_FAIR_SIGNUP_ROWS.find((row) => row.key === value) ?? null;
}

export function getHancockCountyFairSignupLabel(
  value: HancockCountyFairSignupKey,
): string {
  return getHancockCountyFairSignupRow(value)?.label ?? value;
}
