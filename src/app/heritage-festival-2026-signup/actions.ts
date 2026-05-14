"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import {
  getHeritageFestivalSignupLabel,
  isHeritageFestivalSignupDate,
} from "@/lib/heritage-festival-signups";
import { sendHeritageFestivalSignupNotification } from "@/lib/heritage-festival-signup-notifications";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function addHeritageFestivalSignup(formData: FormData) {
  const signupDate = String(formData.get("signup_date") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim().replace(/\s+/g, " ");

  if (!isHeritageFestivalSignupDate(signupDate)) {
    throw new Error("Invalid Heritage Festival signup date");
  }

  if (!name) {
    throw new Error("Name is required");
  }

  const { error } = await getSupabaseAdmin().from("heritage_festival_signups").insert({
    signup_date: signupDate,
    name,
  });

  if (error) {
    throw new Error(
      `Could not save your sign up for ${getHeritageFestivalSignupLabel(signupDate)}.`,
    );
  }

  try {
    await sendHeritageFestivalSignupNotification({ signupDate, name });
  } catch (notificationError) {
    console.error(
      "Heritage Festival signup notification failed",
      notificationError,
    );
  }

  updateTag("heritage-festival-signups");
  redirect(`/heritage-festival-2026-signup#${signupDate}`);
}
