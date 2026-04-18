/** YYYY-MM-DD for "today" in an IANA timezone (chapter locale). */
export function getTodayYmdInTimezone(timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const d = parts.find((p) => p.type === "day")?.value;
  if (!y || !m || !d) {
    return new Date().toISOString().slice(0, 10);
  }
  return `${y}-${m}-${d}`;
}

/** Lexicographic compare works for YYYY-MM-DD. */
export function compareYmd(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/** Format an ISO instant in a chapter timezone (e.g. order deadline). */
export function formatInstantInTimezone(
  iso: string | null | undefined,
  timeZone: string
): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("en-US", {
    timeZone,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}
