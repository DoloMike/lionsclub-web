import {
  SITE_PHOTO_BATCH_BODY_SOFT_LIMIT_BYTES,
  SITE_PHOTO_MAX_BYTES,
} from "@/lib/site-photos";

export type SitePhotoUploadErrorGuidance = {
  title: string;
  body: string;
};

/**
 * Maps framework / proxy upload failures to admin-friendly copy. Used in
 * error boundaries when the Server Action never runs (e.g. truncated body).
 */
export function sitePhotoUploadErrorGuidance(
  rawMessage: string,
): SitePhotoUploadErrorGuidance | null {
  const m = rawMessage.toLowerCase();
  const perMb = SITE_PHOTO_MAX_BYTES / (1024 * 1024);
  const batchMb = SITE_PHOTO_BATCH_BODY_SOFT_LIMIT_BYTES / (1024 * 1024);

  if (
    m.includes("unexpected end of form") ||
    m.includes("body exceeded") ||
    m.includes("bodysizelimit") ||
    m.includes("body size limit") ||
    m.includes("request entity too large") ||
    m.includes("payload too large") ||
    m.includes("entity too large")
  ) {
    return {
      title: "Upload did not finish — batch may be too large",
      body: [
        `The server stopped reading this request before the entire upload arrived. That usually means the total size of all files in one go (plus the form fields) exceeded what the app or a proxy allows, or the connection was cut off.`,
        ``,
        `Limits:`,
        `• Each file: up to ${perMb} MB.`,
        `• All files in one submit together: aim for under about ${batchMb} MB total so several full-size images still fit (multipart adds overhead).`,
        ``,
        `Try fewer photos in one batch, or compress or resize images, then upload again.`,
      ].join("\n"),
    };
  }

  return null;
}
