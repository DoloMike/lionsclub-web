import { env } from "@/lib/env";

export const SITE_PHOTO_BUCKET = "site-photos";

/**
 * Allowed upload MIME types — kept in sync with the bucket's
 * `allowed_mime_types` constraint in `20260513240000_site_photos.sql`.
 */
export const SITE_PHOTO_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

/** Maximum upload size — mirrors the bucket's `file_size_limit` (10 MiB). */
export const SITE_PHOTO_MAX_BYTES = 10 * 1024 * 1024;

export type SitePhoto = {
  id: string;
  section: string;
  storagePath: string;
  publicUrl: string;
  altText: string;
  caption: string | null;
  sortOrder: number;
  published: boolean;
};

/**
 * Build the public CDN URL for a stored photo. Safe to call on the client —
 * only uses the public Supabase URL, never the service-role key.
 */
export function buildSitePhotoPublicUrl(storagePath: string): string {
  const base = env.supabase.url.replace(/\/+$/, "");
  return `${base}/storage/v1/object/public/${SITE_PHOTO_BUCKET}/${encodeStoragePath(storagePath)}`;
}

function encodeStoragePath(path: string): string {
  return path
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
}

/**
 * Adds a query param so the browser uses a new cache key. Use in `img`
 * `onError` when a public storage URL may have a stale bad response in the
 * HTTP cache (e.g. transient 400 right after upload). Supabase ignores
 * unknown params for these GETs.
 */
export function withImageCacheBust(url: string, token: string): string {
  const u = new URL(url);
  u.searchParams.set("__cb", token);
  return u.toString();
}

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export function extensionForMimeType(mime: string): string | null {
  return EXT_BY_MIME[mime] ?? null;
}
