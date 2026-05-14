"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { deriveDisplayName } from "@/lib/auth/display-name";
import { getSessionUser } from "@/lib/auth/get-session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

class VolunteerSignupAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VolunteerSignupAuthError";
  }
}

export async function addVolunteerSignup(formData: FormData) {
  const shiftId = String(formData.get("shift_id") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  if (!shiftId) throw new Error("Missing shift id");
  if (!slug) throw new Error("Missing event slug");

  const user = await getSessionUser();
  if (!user) {
    throw new VolunteerSignupAuthError(
      "Please sign in to add yourself to a shift.",
    );
  }
  const name = deriveDisplayName(user);

  const admin = getSupabaseAdmin();

  const { data: shift, error: shiftErr } = await admin
    .from("volunteer_shifts")
    .select("id, event_id, max_signups")
    .eq("id", shiftId)
    .maybeSingle();
  if (shiftErr) throw shiftErr;
  if (!shift) throw new Error("Shift not found");

  const { data: event, error: evErr } = await admin
    .from("volunteer_events")
    .select("id, slug, published, signups_open")
    .eq("id", shift.event_id)
    .maybeSingle();
  if (evErr) throw evErr;
  if (!event) throw new Error("Event not found");
  if (event.slug !== slug) {
    throw new Error("Shift does not belong to this event");
  }
  if (!event.published || !event.signups_open) {
    throw new Error("Signups are not currently open for this event");
  }

  if (shift.max_signups != null) {
    const { count, error: countErr } = await admin
      .from("volunteer_signups")
      .select("id", { count: "exact", head: true })
      .eq("shift_id", shiftId);
    if (countErr) throw countErr;
    if ((count ?? 0) >= shift.max_signups) {
      throw new Error("This shift is full");
    }
  }

  const { error: insertErr } = await admin
    .from("volunteer_signups")
    .insert({ shift_id: shiftId, user_id: user.id, name });

  // 23505 = unique_violation — the partial index
  // `volunteer_signups_shift_user_unique_idx` makes a second click idempotent
  // (user is already signed up). Treat it as success.
  if (insertErr && insertErr.code !== "23505") throw insertErr;

  updateTag(`volunteer-event:${slug}`);
  redirect(`/volunteer/${slug}#shift-${shiftId}`);
}

export async function removeMyVolunteerSignup(formData: FormData) {
  const signupId = String(formData.get("signup_id") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  if (!signupId) throw new Error("Missing signup id");
  if (!slug) throw new Error("Missing event slug");

  const user = await getSessionUser();
  if (!user) {
    throw new VolunteerSignupAuthError(
      "Please sign in to manage your sign-up.",
    );
  }

  const admin = getSupabaseAdmin();

  const { data: existing, error: lookupErr } = await admin
    .from("volunteer_signups")
    .select("id, shift_id, user_id")
    .eq("id", signupId)
    .maybeSingle();
  if (lookupErr) throw lookupErr;

  // Already gone — bounce back gracefully so a double-click doesn't 500.
  if (!existing) {
    updateTag(`volunteer-event:${slug}`);
    redirect(`/volunteer/${slug}`);
  }
  if (existing.user_id !== user.id) {
    throw new Error("You can only remove your own sign-up.");
  }

  const { error: delErr } = await admin
    .from("volunteer_signups")
    .delete()
    .eq("id", signupId);
  if (delErr) throw delErr;

  updateTag(`volunteer-event:${slug}`);
  redirect(`/volunteer/${slug}#shift-${existing.shift_id}`);
}
