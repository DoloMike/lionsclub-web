import "server-only";

import {
  HANCOCK_COUNTY_FAIR_SIGNUP_ROWS,
  type HancockCountyFairSignupKey,
  type HancockCountyFairSignupRow,
  type HancockCountyFairSignupSheetRow,
} from "@/lib/hancock-county-fair-signups";
import { createPublicServerClient } from "@/lib/supabase/public-server";

type HancockCountyFairSignupDbRow = {
  id: string;
  signup_key: HancockCountyFairSignupKey;
  name: string;
};

export function buildEmptyHancockCountyFairSignupSheet(): HancockCountyFairSignupSheetRow[] {
  return HANCOCK_COUNTY_FAIR_SIGNUP_ROWS.map((row) => ({
    ...row,
    signups: [],
  }));
}

export async function getHancockCountyFairSignupSheet(): Promise<
  HancockCountyFairSignupSheetRow[]
> {
  const supabase = createPublicServerClient();

  if (!supabase) {
    return buildEmptyHancockCountyFairSignupSheet();
  }

  const { data, error } = await supabase
    .from("hancock_county_fair_signups")
    .select("id, signup_key, name")
    .order("signup_key", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data) {
    throw error ?? new Error("Could not load Hancock County Fair signups");
  }

  const grouped = new Map<HancockCountyFairSignupKey, HancockCountyFairSignupRow[]>();

  for (const row of data as HancockCountyFairSignupDbRow[]) {
    const current = grouped.get(row.signup_key) ?? [];
    current.push({ id: row.id, name: row.name });
    grouped.set(row.signup_key, current);
  }

  return HANCOCK_COUNTY_FAIR_SIGNUP_ROWS.map((row) => ({
    ...row,
    signups: grouped.get(row.key) ?? [],
  }));
}
