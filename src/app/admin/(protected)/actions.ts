"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { assertAdmin } from "@/lib/auth/assert-admin";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  isValidVolunteerEventSlug,
  slugifyVolunteerEventTitle,
} from "@/lib/volunteer-signups";
import sharp from "sharp";
import { isSitePhotoSectionKey } from "@/lib/photo-sections";
import {
  SITE_PHOTO_ALLOWED_MIME_TYPES,
  SITE_PHOTO_BUCKET,
  SITE_PHOTO_MAX_BYTES,
} from "@/lib/site-photos";

/**
 * Server-side sign out for the admin login page's "forbidden" recovery
 * affordance (non-admin user reached /admin). Clears the SSR session cookies
 * and redirects to the home page. Authenticated UI surfaces use the shared
 * client-side `useSignOut` hook instead so the Supabase browser client state
 * is also wiped.
 */
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

// ---------------------------------------------------------------------------
// Volunteer signups (admin-managed signup sheets for non-fundraiser events).
// ---------------------------------------------------------------------------

function parseOptionalPositiveInt(raw: string): number | null {
  if (raw === "") return null;
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) {
    throw new Error("Value must be a positive integer or blank");
  }
  return n;
}

function parseSortOrder(raw: string): number {
  if (raw === "") return 0;
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n)) {
    throw new Error("Sort order must be an integer");
  }
  return n;
}

function readVolunteerEventFields(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!title) throw new Error("Title is required");
  if (title.length > 120) throw new Error("Title is too long (max 120)");

  let slug = slugRaw || slugifyVolunteerEventTitle(title);
  if (!isValidVolunteerEventSlug(slug)) {
    // Repair common slug-field typos (uppercase / whitespace / punctuation)
    // by re-slugifying rather than rejecting the submission outright.
    slug = slugifyVolunteerEventTitle(slugRaw || title);
  }
  if (!isValidVolunteerEventSlug(slug)) {
    throw new Error("Slug must be lowercase letters, numbers, and dashes");
  }

  const published = formData.get("published") === "on";
  const signups_open = formData.get("signups_open") === "on";

  return {
    title,
    slug,
    description: description || null,
    published,
    signups_open,
  };
}

export async function addVolunteerEvent(formData: FormData) {
  await assertAdmin();
  const fields = readVolunteerEventFields(formData);

  const admin = getSupabaseAdmin();
  let slug = fields.slug;
  for (let attempt = 0; attempt < 5; attempt++) {
    const { error } = await admin
      .from("volunteer_events")
      .insert({ ...fields, slug });
    if (!error) {
      updateTag(`volunteer-event:${slug}`);
      redirect("/admin/volunteer?saved=1");
    }
    if (error.code === "23505") {
      slug = `${fields.slug}-${Math.random().toString(36).slice(2, 7)}`;
      continue;
    }
    throw error;
  }
  throw new Error("Could not create event — try a different title or slug.");
}

export async function updateVolunteerEvent(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing id");
  const fields = readVolunteerEventFields(formData);

  const { error } = await getSupabaseAdmin()
    .from("volunteer_events")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      throw new Error("That slug is already in use — choose another.");
    }
    throw error;
  }
  updateTag(`volunteer-event:${fields.slug}`);
  redirect("/admin/volunteer?saved=1");
}

export async function deleteVolunteerEvent(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing id");

  // Look up the slug so we can invalidate its public cache tag after the row
  // (and the cascaded shifts / signups) are gone.
  const { data: event } = await getSupabaseAdmin()
    .from("volunteer_events")
    .select("slug")
    .eq("id", id)
    .maybeSingle();

  const { error } = await getSupabaseAdmin()
    .from("volunteer_events")
    .delete()
    .eq("id", id);
  if (error) throw error;

  if (event?.slug) updateTag(`volunteer-event:${event.slug}`);
  redirect("/admin/volunteer?saved=1");
}

export async function toggleVolunteerEventPublished(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  const published = formData.get("published") === "true";
  if (!id) throw new Error("Missing id");

  const { data: event, error } = await getSupabaseAdmin()
    .from("volunteer_events")
    .update({ published, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("slug")
    .maybeSingle();
  if (error) throw error;
  if (event?.slug) updateTag(`volunteer-event:${event.slug}`);
  redirect("/admin/volunteer?saved=1");
}

export async function toggleVolunteerEventSignupsOpen(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  const signups_open = formData.get("signups_open") === "true";
  if (!id) throw new Error("Missing id");

  const { data: event, error } = await getSupabaseAdmin()
    .from("volunteer_events")
    .update({ signups_open, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("slug")
    .maybeSingle();
  if (error) throw error;
  if (event?.slug) updateTag(`volunteer-event:${event.slug}`);
  redirect("/admin/volunteer?saved=1");
}

function readVolunteerShiftFields(formData: FormData) {
  const shift_date = String(formData.get("shift_date") ?? "").trim();
  if (!shift_date || !/^\d{4}-\d{2}-\d{2}$/.test(shift_date)) {
    throw new Error("Shift date is required (YYYY-MM-DD)");
  }
  const shiftLabelRaw = String(formData.get("shift_label") ?? "").trim();
  const timeLabelRaw = String(formData.get("time_label") ?? "").trim();
  const notesRaw = String(formData.get("notes") ?? "").trim();
  const sortOrderRaw = String(formData.get("sort_order") ?? "").trim();
  const maxSignupsRaw = String(formData.get("max_signups") ?? "").trim();

  if (shiftLabelRaw.length > 80) {
    throw new Error("Shift label is too long (max 80)");
  }
  if (timeLabelRaw.length > 80) {
    throw new Error("Time label is too long (max 80)");
  }
  if (notesRaw.length > 500) {
    throw new Error("Notes are too long (max 500)");
  }

  return {
    shift_date,
    shift_label: shiftLabelRaw || null,
    time_label: timeLabelRaw || null,
    notes: notesRaw || null,
    sort_order: parseSortOrder(sortOrderRaw),
    max_signups: parseOptionalPositiveInt(maxSignupsRaw),
  };
}

async function getEventSlugForId(eventId: string): Promise<string | null> {
  const { data } = await getSupabaseAdmin()
    .from("volunteer_events")
    .select("slug")
    .eq("id", eventId)
    .maybeSingle();
  return data?.slug ?? null;
}

export async function addVolunteerShift(formData: FormData) {
  await assertAdmin();
  const event_id = String(formData.get("event_id") ?? "");
  if (!event_id) throw new Error("Missing event id");
  const fields = readVolunteerShiftFields(formData);

  const { error } = await getSupabaseAdmin()
    .from("volunteer_shifts")
    .insert({ event_id, ...fields });
  if (error) throw error;

  const slug = await getEventSlugForId(event_id);
  if (slug) updateTag(`volunteer-event:${slug}`);
  redirect("/admin/volunteer?saved=1");
}

export async function updateVolunteerShift(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing shift id");
  const fields = readVolunteerShiftFields(formData);

  const { data: shift, error: shiftErr } = await getSupabaseAdmin()
    .from("volunteer_shifts")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("event_id")
    .maybeSingle();
  if (shiftErr) throw shiftErr;

  if (shift?.event_id) {
    const slug = await getEventSlugForId(shift.event_id);
    if (slug) updateTag(`volunteer-event:${slug}`);
  }
  redirect("/admin/volunteer?saved=1");
}

export async function deleteVolunteerShift(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing shift id");

  const { data: shift } = await getSupabaseAdmin()
    .from("volunteer_shifts")
    .select("event_id")
    .eq("id", id)
    .maybeSingle();

  const { error } = await getSupabaseAdmin()
    .from("volunteer_shifts")
    .delete()
    .eq("id", id);
  if (error) throw error;

  if (shift?.event_id) {
    const slug = await getEventSlugForId(shift.event_id);
    if (slug) updateTag(`volunteer-event:${slug}`);
  }
  redirect("/admin/volunteer?saved=1");
}

export async function deleteVolunteerSignup(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing signup id");

  // Resolve event slug *before* the delete so we can invalidate cache tags.
  const { data: signup } = await getSupabaseAdmin()
    .from("volunteer_signups")
    .select("shift_id")
    .eq("id", id)
    .maybeSingle();

  let eventId: string | null = null;
  if (signup?.shift_id) {
    const { data: shift } = await getSupabaseAdmin()
      .from("volunteer_shifts")
      .select("event_id")
      .eq("id", signup.shift_id)
      .maybeSingle();
    eventId = shift?.event_id ?? null;
  }

  const { error } = await getSupabaseAdmin()
    .from("volunteer_signups")
    .delete()
    .eq("id", id);
  if (error) throw error;

  if (eventId) {
    const slug = await getEventSlugForId(eventId);
    if (slug) updateTag(`volunteer-event:${slug}`);
  }
  redirect("/admin/volunteer?saved=1");
}

// ---------------------------------------------------------------------------
// Site photos (admin-managed photos shown on public pages, e.g. banners).
// ---------------------------------------------------------------------------

function readSitePhotoSection(formData: FormData): string {
  const section = String(formData.get("section") ?? "").trim();
  if (!section) throw new Error("Missing photo section");
  if (!isSitePhotoSectionKey(section)) {
    throw new Error(`Unknown photo section: ${section}`);
  }
  return section;
}

function readSitePhotoMetadataFields(formData: FormData) {
  const altText = String(formData.get("alt_text") ?? "")
    .trim()
    .replace(/\s+/g, " ");
  if (!altText) throw new Error("Alt text is required");
  if (altText.length > 200) {
    throw new Error("Alt text is too long (max 200 characters)");
  }

  const captionRaw = String(formData.get("caption") ?? "").trim();
  if (captionRaw.length > 280) {
    throw new Error("Caption is too long (max 280 characters)");
  }

  const published = formData.get("published") === "on";

  return {
    alt_text: altText,
    caption: captionRaw || null,
    published,
  };
}

/**
 * Resize-and-recompress to a sane upper bound and emit WebP so the public
 * banner pulls smaller, format-consistent files regardless of what admins
 * upload (massive iPhone HEIC-converted JPEGs, screenshots, etc.). Also strips
 * EXIF metadata (including geolocation) and auto-rotates portrait shots that
 * rely on the EXIF orientation flag.
 */
async function optimizeUploadedImage(file: File): Promise<{
  buffer: Buffer;
  contentType: string;
  extension: string;
}> {
  const inputBuffer = Buffer.from(await file.arrayBuffer());
  const outputBuffer = await sharp(inputBuffer, { failOn: "warning" })
    .rotate()
    .resize({
      width: 1920,
      height: 1920,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 82, effort: 4 })
    .toBuffer();
  return {
    buffer: outputBuffer,
    contentType: "image/webp",
    extension: "webp",
  };
}

async function maxSortOrderForSection(section: string): Promise<number> {
  const { data, error } = await getSupabaseAdmin()
    .from("site_photos")
    .select("sort_order")
    .eq("section", section)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data?.sort_order ?? 0;
}

export async function addSitePhotos(formData: FormData) {
  await assertAdmin();
  const section = readSitePhotoSection(formData);
  const { alt_text, caption, published } =
    readSitePhotoMetadataFields(formData);

  const rawFiles = formData.getAll("file");
  const files = rawFiles.filter(
    (f): f is File => f instanceof File && f.size > 0,
  );
  if (files.length === 0) {
    throw new Error("Please choose at least one image to upload");
  }
  for (const file of files) {
    if (
      !SITE_PHOTO_ALLOWED_MIME_TYPES.includes(
        file.type as (typeof SITE_PHOTO_ALLOWED_MIME_TYPES)[number],
      )
    ) {
      throw new Error(
        `"${file.name}" is not a supported image type — use JPEG, PNG, WEBP, or AVIF.`,
      );
    }
    if (file.size > SITE_PHOTO_MAX_BYTES) {
      throw new Error(`"${file.name}" is too large (max 10 MB).`);
    }
  }

  const admin = getSupabaseAdmin();
  const baseSortOrder = await maxSortOrderForSection(section);
  const uploadedPaths: string[] = [];

  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]!;
      const optimized = await optimizeUploadedImage(file);
      const storagePath = `${section}/${crypto.randomUUID()}.${optimized.extension}`;

      const { error: uploadErr } = await admin.storage
        .from(SITE_PHOTO_BUCKET)
        .upload(storagePath, optimized.buffer, {
          contentType: optimized.contentType,
          upsert: false,
        });
      if (uploadErr) {
        throw new Error(
          `Could not upload "${file.name}": ${uploadErr.message}`,
        );
      }
      uploadedPaths.push(storagePath);

      const { error: insertErr } = await admin.from("site_photos").insert({
        section,
        storage_path: storagePath,
        alt_text,
        caption,
        sort_order: baseSortOrder + i + 1,
        published,
      });
      if (insertErr) throw insertErr;
    }
  } catch (err) {
    // Roll back any storage objects we wrote so the bucket doesn't accumulate
    // orphan blobs whose metadata rows never made it in.
    if (uploadedPaths.length > 0) {
      await admin.storage
        .from(SITE_PHOTO_BUCKET)
        .remove(uploadedPaths)
        .catch(() => undefined);
    }
    throw err;
  }

  updateTag(`site-photos:${section}`);
  redirect("/admin/photos?saved=1");
}

export async function reorderSitePhotos(formData: FormData) {
  await assertAdmin();
  const section = readSitePhotoSection(formData);
  const orderedIds = formData
    .getAll("id")
    .map((v) => String(v))
    .filter((v) => v.length > 0);
  if (orderedIds.length === 0) {
    throw new Error("No photos to reorder");
  }

  const admin = getSupabaseAdmin();

  // Scope the update to this section so a forged id from another section can't
  // bleed in. We could also `.in("id", orderedIds).select("id, section")`
  // upfront, but per-row UPDATE with both filters keeps the check inline.
  await Promise.all(
    orderedIds.map((id, idx) =>
      admin
        .from("site_photos")
        .update({
          sort_order: idx,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("section", section),
    ),
  );

  updateTag(`site-photos:${section}`);
  redirect("/admin/photos?saved=1");
}

export async function updateSitePhoto(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing photo id");
  const fields = readSitePhotoMetadataFields(formData);

  // Intentionally NOT touching sort_order — that's owned by `reorderSitePhotos`
  // (drag-and-drop). Saving metadata after a drag must never revert the order.
  const { data: photo, error } = await getSupabaseAdmin()
    .from("site_photos")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("section")
    .maybeSingle();
  if (error) throw error;

  if (photo?.section) updateTag(`site-photos:${photo.section}`);
  redirect("/admin/photos?saved=1");
}

export async function deleteSitePhoto(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing photo id");

  const admin = getSupabaseAdmin();
  const { data: photo, error: lookupErr } = await admin
    .from("site_photos")
    .select("section, storage_path")
    .eq("id", id)
    .maybeSingle();
  if (lookupErr) throw lookupErr;
  if (!photo) {
    redirect("/admin/photos?saved=1");
  }

  const { error: delErr } = await admin
    .from("site_photos")
    .delete()
    .eq("id", id);
  if (delErr) throw delErr;

  // Best-effort storage cleanup — if the object is already gone, ignore it
  // rather than failing the action.
  if (photo.storage_path) {
    await admin.storage
      .from(SITE_PHOTO_BUCKET)
      .remove([photo.storage_path])
      .catch(() => undefined);
  }

  updateTag(`site-photos:${photo.section}`);
  redirect("/admin/photos?saved=1");
}
