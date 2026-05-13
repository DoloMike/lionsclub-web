export const HERITAGE_FESTIVAL_SIGNUP_CLOSE_TIME_LABEL = "Closes at 5:00 PM";

export const HERITAGE_FESTIVAL_SIGNUP_DAYS = [
  { date: "2026-05-28", label: "Thursday, May 28, 2026" },
  { date: "2026-05-29", label: "Friday, May 29, 2026" },
  { date: "2026-05-30", label: "Saturday, May 30, 2026" },
] as const;

export type HeritageFestivalSignupDate =
  (typeof HERITAGE_FESTIVAL_SIGNUP_DAYS)[number]["date"];

export type HeritageFestivalSignupRow = {
  id: string;
  name: string;
};

export type HeritageFestivalSignupSheetDay = {
  date: HeritageFestivalSignupDate;
  label: string;
  signups: HeritageFestivalSignupRow[];
};

const HERITAGE_FESTIVAL_SIGNUP_DATE_SET = new Set<HeritageFestivalSignupDate>(
  HERITAGE_FESTIVAL_SIGNUP_DAYS.map((day) => day.date),
);

export function isHeritageFestivalSignupDate(
  value: string,
): value is HeritageFestivalSignupDate {
  return HERITAGE_FESTIVAL_SIGNUP_DATE_SET.has(value as HeritageFestivalSignupDate);
}

export function getHeritageFestivalSignupLabel(
  value: HeritageFestivalSignupDate,
): string {
  return (
    HERITAGE_FESTIVAL_SIGNUP_DAYS.find((day) => day.date === value)?.label ?? value
  );
}
