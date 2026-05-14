/**
 * Pure types and display helpers for admin-managed volunteer signup events.
 * No DB or server-only imports — safe to use from client and server code.
 */

export type VolunteerEvent = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  published: boolean;
  signupsOpen: boolean;
  createdAt: string;
  updatedAt: string;
};

export type VolunteerShift = {
  id: string;
  eventId: string;
  shiftDate: string;
  shiftLabel: string | null;
  timeLabel: string | null;
  notes: string | null;
  sortOrder: number;
  maxSignups: number | null;
};

export type VolunteerSignup = {
  id: string;
  shiftId: string;
  /**
   * `null` only for legacy rows that pre-date the auth requirement.
   * New signups always carry the auth user id.
   */
  userId: string | null;
  name: string;
  createdAt: string;
};

export type VolunteerShiftWithSignups = VolunteerShift & {
  signups: VolunteerSignup[];
  signupCount: number;
};

export type VolunteerEventWithShifts = VolunteerEvent & {
  shifts: VolunteerShiftWithSignups[];
};

/**
 * Format a YYYY-MM-DD date string as a human label without timezone drift.
 * Parsing through `new Date(isoDate)` would interpret the string as UTC midnight
 * and then shift to the local zone — that off-by-one is unacceptable for a
 * civic signup sheet, so we parse the parts manually and format in UTC.
 */
export function formatShiftDateLabel(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return isoDate;
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidVolunteerEventSlug(value: string): boolean {
  return SLUG_PATTERN.test(value);
}

export function slugifyVolunteerEventTitle(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return base || "event";
}
