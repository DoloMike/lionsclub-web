import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  buildSitePhotoPublicUrl,
  SITE_PHOTO_BUCKET,
  type SitePhoto,
} from "@/lib/site-photos";

type SitePhotoRow = {
  id: string;
  section: string;
  storage_path: string;
  alt_text: string;
  caption: string | null;
  sort_order: number;
  published: boolean;
};

const COLUMNS =
  "id, section, storage_path, alt_text, caption, sort_order, published";

function toSitePhoto(row: SitePhotoRow): SitePhoto {
  return {
    id: row.id,
    section: row.section,
    storagePath: row.storage_path,
    publicUrl: buildSitePhotoPublicUrl(row.storage_path),
    altText: row.alt_text,
    caption: row.caption,
    sortOrder: row.sort_order,
    published: row.published,
  };
}

/** Public-facing read: only includes published rows. */
export async function getPublishedSitePhotosBySection(
  section: string,
): Promise<SitePhoto[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("site_photos")
    .select(COLUMNS)
    .eq("section", section)
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as SitePhotoRow[]).map(toSitePhoto);
}

/** Admin-facing read: includes unpublished rows so admins can see drafts. */
export async function getAllSitePhotosBySection(
  section: string,
): Promise<SitePhoto[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("site_photos")
    .select(COLUMNS)
    .eq("section", section)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as SitePhotoRow[]).map(toSitePhoto);
}

export { SITE_PHOTO_BUCKET };
