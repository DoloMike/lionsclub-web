import "server-only";

import {
  HERITAGE_FESTIVAL_SIGNUP_DAYS,
  type HeritageFestivalSignupDate,
  type HeritageFestivalSignupRow,
  type HeritageFestivalSignupSheetDay,
} from "@/lib/heritage-festival-signups";
import { createPublicServerClient } from "@/lib/supabase/public-server";

type HeritageFestivalSignupDbRow = {
  id: string;
  signup_date: HeritageFestivalSignupDate;
  name: string;
};

export function buildEmptyHeritageFestivalSignupSheet(): HeritageFestivalSignupSheetDay[] {
  return HERITAGE_FESTIVAL_SIGNUP_DAYS.map((day) => ({
    ...day,
    signups: [],
  }));
}

export async function getHeritageFestivalSignupSheet(): Promise<
  HeritageFestivalSignupSheetDay[]
> {
  const supabase = createPublicServerClient();

  if (!supabase) {
    return buildEmptyHeritageFestivalSignupSheet();
  }

  const { data, error } = await supabase
    .from("heritage_festival_signups")
    .select("id, signup_date, name")
    .order("signup_date", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data) {
    throw error ?? new Error("Could not load Heritage Festival signups");
  }

  const grouped = new Map<HeritageFestivalSignupDate, HeritageFestivalSignupRow[]>();

  for (const row of data as HeritageFestivalSignupDbRow[]) {
    const current = grouped.get(row.signup_date) ?? [];
    current.push({ id: row.id, name: row.name });
    grouped.set(row.signup_date, current);
  }

  return HERITAGE_FESTIVAL_SIGNUP_DAYS.map((day) => ({
    ...day,
    signups: grouped.get(day.date) ?? [],
  }));
}
