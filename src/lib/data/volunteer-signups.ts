import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  type VolunteerEvent,
  type VolunteerEventWithShifts,
  type VolunteerShift,
  type VolunteerShiftWithSignups,
  type VolunteerSignup,
} from "@/lib/volunteer-signups";

type EventRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  published: boolean;
  signups_open: boolean;
  created_at: string;
  updated_at: string;
};

type ShiftRow = {
  id: string;
  event_id: string;
  shift_date: string;
  shift_label: string | null;
  time_label: string | null;
  notes: string | null;
  sort_order: number;
  max_signups: number | null;
};

type SignupRow = {
  id: string;
  shift_id: string;
  user_id: string | null;
  name: string;
  created_at: string;
};

const EVENT_COLUMNS =
  "id, title, slug, description, published, signups_open, created_at, updated_at";
const SHIFT_COLUMNS =
  "id, event_id, shift_date, shift_label, time_label, notes, sort_order, max_signups";
const SIGNUP_COLUMNS = "id, shift_id, user_id, name, created_at";

function toEvent(row: EventRow): VolunteerEvent {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    published: row.published,
    signupsOpen: row.signups_open,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toShift(row: ShiftRow): VolunteerShift {
  return {
    id: row.id,
    eventId: row.event_id,
    shiftDate: row.shift_date,
    shiftLabel: row.shift_label,
    timeLabel: row.time_label,
    notes: row.notes,
    sortOrder: row.sort_order,
    maxSignups: row.max_signups,
  };
}

function toSignup(row: SignupRow): VolunteerSignup {
  return {
    id: row.id,
    shiftId: row.shift_id,
    userId: row.user_id,
    name: row.name,
    createdAt: row.created_at,
  };
}

async function loadSignupsByShift(
  shiftIds: string[],
): Promise<Map<string, VolunteerSignup[]>> {
  const grouped = new Map<string, VolunteerSignup[]>();
  if (shiftIds.length === 0) return grouped;
  const { data, error } = await getSupabaseAdmin()
    .from("volunteer_signups")
    .select(SIGNUP_COLUMNS)
    .in("shift_id", shiftIds)
    .order("created_at", { ascending: true });
  if (error) throw error;
  for (const row of (data ?? []) as SignupRow[]) {
    const signup = toSignup(row);
    const list = grouped.get(signup.shiftId) ?? [];
    list.push(signup);
    grouped.set(signup.shiftId, list);
  }
  return grouped;
}

function attachSignups(
  shifts: VolunteerShift[],
  signupsByShift: Map<string, VolunteerSignup[]>,
): VolunteerShiftWithSignups[] {
  return shifts.map((shift) => {
    const signups = signupsByShift.get(shift.id) ?? [];
    return { ...shift, signups, signupCount: signups.length };
  });
}

export async function getPublishedVolunteerEvents(): Promise<VolunteerEvent[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("volunteer_events")
    .select(EVENT_COLUMNS)
    .eq("published", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as EventRow[]).map(toEvent);
}

export async function getVolunteerEventBySlug(
  slug: string,
  { includeUnpublished = false }: { includeUnpublished?: boolean } = {},
): Promise<VolunteerEventWithShifts | null> {
  let query = getSupabaseAdmin()
    .from("volunteer_events")
    .select(EVENT_COLUMNS)
    .eq("slug", slug)
    .limit(1);
  if (!includeUnpublished) {
    query = query.eq("published", true);
  }
  const { data, error } = await query;
  if (error) throw error;
  const row = ((data ?? []) as EventRow[])[0];
  if (!row) return null;
  const event = toEvent(row);

  const { data: shiftRows, error: shiftErr } = await getSupabaseAdmin()
    .from("volunteer_shifts")
    .select(SHIFT_COLUMNS)
    .eq("event_id", event.id)
    .order("sort_order", { ascending: true })
    .order("shift_date", { ascending: true })
    .order("created_at", { ascending: true });
  if (shiftErr) throw shiftErr;
  const shifts = ((shiftRows ?? []) as ShiftRow[]).map(toShift);

  const signupsByShift = await loadSignupsByShift(shifts.map((s) => s.id));
  return { ...event, shifts: attachSignups(shifts, signupsByShift) };
}

export async function getAllVolunteerEventsForAdmin(): Promise<
  VolunteerEventWithShifts[]
> {
  const { data: eventRows, error } = await getSupabaseAdmin()
    .from("volunteer_events")
    .select(EVENT_COLUMNS)
    .order("created_at", { ascending: false });
  if (error) throw error;
  const events = ((eventRows ?? []) as EventRow[]).map(toEvent);
  if (events.length === 0) return [];

  const { data: shiftRows, error: shiftErr } = await getSupabaseAdmin()
    .from("volunteer_shifts")
    .select(SHIFT_COLUMNS)
    .in(
      "event_id",
      events.map((e) => e.id),
    )
    .order("sort_order", { ascending: true })
    .order("shift_date", { ascending: true })
    .order("created_at", { ascending: true });
  if (shiftErr) throw shiftErr;
  const shifts = ((shiftRows ?? []) as ShiftRow[]).map(toShift);

  const signupsByShift = await loadSignupsByShift(shifts.map((s) => s.id));
  const shiftsByEvent = new Map<string, VolunteerShiftWithSignups[]>();
  for (const shift of attachSignups(shifts, signupsByShift)) {
    const list = shiftsByEvent.get(shift.eventId) ?? [];
    list.push(shift);
    shiftsByEvent.set(shift.eventId, list);
  }

  return events.map((event) => ({
    ...event,
    shifts: shiftsByEvent.get(event.id) ?? [],
  }));
}
