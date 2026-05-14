/**
 * Canonical list of site photo sections.
 *
 * Each entry is a "place on the public site that admins can upload photos for".
 * Adding a new section is a one-line change here plus rendering the banner in
 * the target page — the admin UI picks it up automatically.
 */
export const SITE_PHOTO_SECTIONS = [
  {
    key: "fundraising-banner",
    label: "Fundraising banner",
    description:
      "Scrolling photo banner at the top of the /fundraising page. Landscape photos (roughly 16:7, e.g. 1600×700) crop best.",
    location: "/fundraising",
  },
  {
    key: "events-banner",
    label: "Events banner",
    description:
      "Scrolling photo banner at the top of the /events page. Landscape photos (roughly 16:7) crop best.",
    location: "/events",
  },
] as const;

export type SitePhotoSection = (typeof SITE_PHOTO_SECTIONS)[number];
export type SitePhotoSectionKey = SitePhotoSection["key"];

const SITE_PHOTO_SECTION_KEYS = new Set<string>(
  SITE_PHOTO_SECTIONS.map((s) => s.key),
);

export function isSitePhotoSectionKey(
  value: string,
): value is SitePhotoSectionKey {
  return SITE_PHOTO_SECTION_KEYS.has(value);
}

export function getSitePhotoSection(
  key: string,
): SitePhotoSection | undefined {
  return SITE_PHOTO_SECTIONS.find((s) => s.key === key);
}
