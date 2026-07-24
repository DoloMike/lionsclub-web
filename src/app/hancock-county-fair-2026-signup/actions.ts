"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import {
  getHancockCountyFairSignupLabel,
  getHancockCountyFairSignupRow,
  isHancockCountyFairSignupKey,
} from "@/lib/hancock-county-fair-signups";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function addHancockCountyFairSignup(formData: FormData) {
  const signupKey = String(formData.get("signup_key") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim().replace(/\s+/g, " ");

  if (!isHancockCountyFairSignupKey(signupKey)) {
    throw new Error("Invalid Hancock County Fair signup row");
  }

  if (!name) {
    throw new Error("Name is required");
  }

  const signupRow = getHancockCountyFairSignupRow(signupKey);

  if (!signupRow) {
    throw new Error("Signup row not found");
  }

  const { count, error: countError } = await getSupabaseAdmin()
    .from("hancock_county_fair_signups")
    .select("id", { count: "exact", head: true })
    .eq("signup_key", signupKey);

  if (countError) {
    throw new Error(
      `Could not check remaining spots for ${getHancockCountyFairSignupLabel(signupKey)}.`,
    );
  }

  if ((count ?? 0) >= signupRow.maxSignups) {
    throw new Error(
      `All ${signupRow.maxSignups} spots for ${getHancockCountyFairSignupLabel(signupKey)} are already filled.`,
    );
  }

  const { error } = await getSupabaseAdmin().from("hancock_county_fair_signups").insert({
    signup_key: signupKey,
    name,
  });

  if (error) {
    throw new Error(
      `Could not save your sign up for ${getHancockCountyFairSignupLabel(signupKey)}.`,
    );
  }

  updateTag("hancock-county-fair-signups");
  redirect(`/hancock-county-fair-2026-signup#${signupKey}`);
}
