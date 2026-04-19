"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { assertAdmin } from "@/lib/auth/assert-admin";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function updateMeetingSchedule(formData: FormData) {
  await assertAdmin();
  const raw = formData.get("meeting_schedule");
  if (typeof raw !== "string") {
    throw new Error("Invalid meeting schedule");
  }
  const meeting_schedule = raw.trim();
  if (!meeting_schedule) {
    throw new Error("Meeting schedule cannot be empty");
  }

  const { error } = await getSupabaseAdmin()
    .from("site_settings")
    .update({
      meeting_schedule,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) throw error;
  updateTag("meeting-schedule");
  redirect("/admin/settings?saved=1");
}

export async function addOfficer(formData: FormData) {
  await assertAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  if (!name || !title) throw new Error("Name and title are required");

  const { count } = await getSupabaseAdmin()
    .from("officers")
    .select("*", { count: "exact", head: true });

  const sort_order = (count ?? 0) + 1;

  const { error } = await getSupabaseAdmin().from("officers").insert({
    name,
    title,
    sort_order,
  });

  if (error) throw error;
  updateTag("officers");
  redirect("/admin/officers?saved=1");
}

export async function deleteOfficer(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing id");

  const { error } = await getSupabaseAdmin().from("officers").delete().eq("id", id);

  if (error) throw error;
  updateTag("officers");
  redirect("/admin/officers?saved=1");
}

export async function addChapterEvent(formData: FormData) {
  await assertAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const event_date = String(formData.get("event_date") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!title || !event_date) throw new Error("Title and date are required");

  const { error } = await getSupabaseAdmin().from("chapter_events").insert({
    title,
    event_date,
    description: description || null,
  });

  if (error) throw error;
  updateTag("chapter-events");
  redirect("/admin/events?saved=1");
}

export async function deleteChapterEvent(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing id");

  const { error } = await getSupabaseAdmin()
    .from("chapter_events")
    .delete()
    .eq("id", id);

  if (error) throw error;
  updateTag("chapter-events");
  redirect("/admin/events?saved=1");
}

const SOCIAL_ICONS = [
  "facebook",
  "instagram",
  "youtube",
  "x",
  "linkedin",
  "blog",
  "link",
] as const;

function parseIconKey(raw: string): (typeof SOCIAL_ICONS)[number] {
  return SOCIAL_ICONS.includes(raw as (typeof SOCIAL_ICONS)[number])
    ? (raw as (typeof SOCIAL_ICONS)[number])
    : "link";
}

export async function addSocialLink(formData: FormData) {
  await assertAdmin();
  const label = String(formData.get("label") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const icon_key = parseIconKey(String(formData.get("icon_key") ?? "link"));
  if (!label || !url) throw new Error("Label and URL are required");
  if (!/^https?:\/\//i.test(url)) {
    throw new Error("URL must start with http:// or https://");
  }

  const { count } = await getSupabaseAdmin()
    .from("social_links")
    .select("*", { count: "exact", head: true });

  const { error } = await getSupabaseAdmin().from("social_links").insert({
    label,
    url,
    icon_key,
    sort_order: (count ?? 0) + 1,
  });

  if (error) throw error;
  updateTag("social-links");
  redirect("/admin/social?saved=1");
}

export async function updateSocialLink(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  const label = String(formData.get("label") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const icon_key = parseIconKey(String(formData.get("icon_key") ?? "link"));
  if (!id || !label || !url) throw new Error("Missing fields");
  if (!/^https?:\/\//i.test(url)) {
    throw new Error("URL must start with http:// or https://");
  }

  const { error } = await getSupabaseAdmin()
    .from("social_links")
    .update({ label, url, icon_key })
    .eq("id", id);

  if (error) throw error;
  updateTag("social-links");
  redirect("/admin/social?saved=1");
}

export async function deleteSocialLink(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing id");

  const { error } = await getSupabaseAdmin()
    .from("social_links")
    .delete()
    .eq("id", id);

  if (error) throw error;
  updateTag("social-links");
  redirect("/admin/social?saved=1");
}

function slugifyTitle(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return base || "fundraiser";
}

export async function toggleFundraiserOrderOpen(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  const order_open = formData.get("order_open") === "true";
  if (!id) throw new Error("Missing id");

  const { error } = await getSupabaseAdmin()
    .from("fundraiser_events")
    .update({ order_open, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
  updateTag("fundraiser-banner");
  redirect("/admin/fundraiser?saved=1");
}

export async function updateFundraiserEvent(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const event_date = String(formData.get("event_date") ?? "").trim();
  const orders_close_date = String(formData.get("orders_close_date") ?? "").trim();
  const pickup_location = String(formData.get("pickup_location") ?? "").trim();
  const pickup_notes = String(formData.get("pickup_notes") ?? "").trim();
  const priceRaw = String(formData.get("price_cents_per_unit") ?? "").trim();
  const maxRaw = String(formData.get("max_units_per_order") ?? "").trim();
  const invRaw = String(formData.get("inventory_units") ?? "").trim();

  if (!id || !title) throw new Error("Title is required");
  const price_cents_per_unit = parseInt(priceRaw, 10);
  const max_units_per_order = parseInt(maxRaw, 10);
  if (!Number.isFinite(price_cents_per_unit) || price_cents_per_unit < 1) {
    throw new Error("Price (cents) must be a positive integer");
  }
  if (!Number.isFinite(max_units_per_order) || max_units_per_order < 1) {
    throw new Error("Max units per order must be at least 1");
  }

  const finalSlug = slug || slugifyTitle(title);
  const inventory_units =
    invRaw === "" ? null : parseInt(invRaw, 10);
  if (inventory_units != null && (!Number.isFinite(inventory_units) || inventory_units < 0)) {
    throw new Error("Inventory must be empty or a non-negative integer");
  }

  if (!orders_close_date || !event_date) {
    throw new Error("Event date and order deadline are required");
  }
  if (orders_close_date > event_date) {
    throw new Error("Order deadline must be on or before the pickup / event date");
  }

  const { error } = await getSupabaseAdmin()
    .from("fundraiser_events")
    .update({
      title,
      slug: finalSlug,
      description: description || null,
      event_date: event_date || null,
      orders_close_date,
      pickup_location: pickup_location || null,
      pickup_notes: pickup_notes || null,
      price_cents_per_unit,
      max_units_per_order,
      inventory_units,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
  updateTag("fundraiser-banner");
  redirect("/admin/fundraiser?saved=1");
}

export async function addFundraiserEvent(formData: FormData) {
  await assertAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const event_date = String(formData.get("event_date") ?? "").trim();
  const orders_close_date = String(formData.get("orders_close_date") ?? "").trim();
  const pickup_location = String(formData.get("pickup_location") ?? "").trim();
  const pickup_notes = String(formData.get("pickup_notes") ?? "").trim();
  const priceRaw = String(formData.get("price_cents_per_unit") ?? "").trim();
  const maxRaw = String(formData.get("max_units_per_order") ?? "").trim();
  const invRaw = String(formData.get("inventory_units") ?? "").trim();
  const order_open = formData.get("order_open") === "on";

  if (!title) throw new Error("Title is required");
  if (!event_date || !orders_close_date) {
    throw new Error("Event date and order deadline are required");
  }
  if (orders_close_date > event_date) {
    throw new Error("Order deadline must be on or before the pickup / event date");
  }
  const price_cents_per_unit = parseInt(priceRaw, 10);
  const max_units_per_order = parseInt(maxRaw, 10) || 20;
  if (!Number.isFinite(price_cents_per_unit) || price_cents_per_unit < 1) {
    throw new Error("Price (cents) must be a positive integer");
  }
  if (!Number.isFinite(max_units_per_order) || max_units_per_order < 1) {
    throw new Error("Max units per order must be at least 1");
  }

  const inventory_units =
    invRaw === "" ? null : parseInt(invRaw, 10);
  if (inventory_units != null && (!Number.isFinite(inventory_units) || inventory_units < 0)) {
    throw new Error("Inventory must be empty or a non-negative integer");
  }

  let slug = slugifyTitle(title);
  const admin = getSupabaseAdmin();
  let inserted = false;
  for (let i = 0; i < 5; i++) {
    const { error } = await admin.from("fundraiser_events").insert({
      title,
      slug,
      description: description || null,
      event_date,
      orders_close_date,
      pickup_location: pickup_location || null,
      pickup_notes: pickup_notes || null,
      price_cents_per_unit,
      max_units_per_order,
      inventory_units,
      order_open,
    });
    if (!error) {
      inserted = true;
      break;
    }
    if (error.code === "23505") {
      slug = `${slugifyTitle(title)}-${Math.random().toString(36).slice(2, 7)}`;
      continue;
    }
    throw error;
  }
  if (!inserted) {
    throw new Error("Could not create fundraiser — try a different title.");
  }

  updateTag("fundraiser-banner");
  redirect("/admin/fundraiser?saved=1");
}
