export const HERITAGE_FESTIVAL_SIGNUP_CLOSE_TIME_LABEL = "5:00 PM - close";

export const HERITAGE_FESTIVAL_SIGNUP_DAYS = [
  {
    date: "2026-05-26",
    title: "Booth Setup",
    label: "Tuesday, May 26, 2026",
    timeLabel: "5:00 PM - 7:00 PM",
  },
  {
    date: "2026-05-28",
    title: null,
    label: "Thursday, May 28, 2026",
    timeLabel: HERITAGE_FESTIVAL_SIGNUP_CLOSE_TIME_LABEL,
  },
  {
    date: "2026-05-29",
    title: null,
    label: "Friday, May 29, 2026",
    timeLabel: HERITAGE_FESTIVAL_SIGNUP_CLOSE_TIME_LABEL,
  },
  {
    date: "2026-05-30",
    title: null,
    label: "Saturday, May 30, 2026",
    timeLabel: HERITAGE_FESTIVAL_SIGNUP_CLOSE_TIME_LABEL,
  },
  {
    date: "2026-05-31",
    title: "Booth Tear Down",
    label: "Sunday, May 31, 2026",
    timeLabel: "1:00 PM - 3:00 PM",
  },
] as const;

export type HeritageFestivalSignupDate =
  (typeof HERITAGE_FESTIVAL_SIGNUP_DAYS)[number]["date"];

export type HeritageFestivalSignupRow = {
  id: string;
  name: string;
};

export type HeritageFestivalSignupSheetDay = {
  date: HeritageFestivalSignupDate;
  title: string | null;
  label: string;
  timeLabel: string;
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
