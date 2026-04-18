/**
 * Chapter facts. Meeting schedule text is overridden from Supabase when configured.
 * Social links default here when DB is empty; otherwise loaded from `social_links`.
 * @see docs/lewisport-lions-site-plan.md
 */
export const site = {
  name: "Lewisport Lions Club",
  shortName: "Lewisport Lions",
  location: "Lewisport, Hancock County, Kentucky",
  district: "District 43-K",
  lcifUrl: "https://www.lionsclubs.org/en/member-resource-center/lcif",
  eClubhouseUrl: "https://e-clubhouse.org/sites/lewisport/projects.php",
  /** Fixed venue — also used for NAP / structured data */
  address: {
    venue: "Lewisport Lions Club Community Center",
    street: "15 Pell Street",
    city: "Lewisport",
    state: "KY",
    zip: "42351",
    /** Single line for footer and schema */
    displayLine:
      "Lewisport Lions Club Community Center, 15 Pell Street, Lewisport, KY 42351",
  },
  /** Fallback when DB is empty or unavailable */
  meeting: {
    schedule:
      "Contact us for the current meeting day, time, and any holiday changes.",
    place: "Lewisport Lions Club Community Center, 15 Pell Street, Lewisport, KY 42351",
  },
  contact: {
    /** Placeholder until a public chapter inbox is finalized */
    email: "admin@lewisportlions.club",
    /** Chapter does not publish a phone number */
    phone: null as string | null,
  },
} as const;

/** Shown only when `social_links` has no rows and Supabase is unavailable */
export const defaultSocialLinks = [
  {
    label: "Facebook",
    url: "https://www.facebook.com/lionsclubs",
    icon_key: "facebook",
  },
  {
    label: "Instagram",
    url: "https://www.instagram.com/lionsclubs",
    icon_key: "instagram",
  },
  {
    label: "YouTube",
    url: "https://www.youtube.com/user/lionsclubsorg",
    icon_key: "youtube",
  },
  { label: "X", url: "https://twitter.com/lionsclubs", icon_key: "x" },
  {
    label: "LinkedIn",
    url: "https://www.linkedin.com/company/lions-clubs-international/",
    icon_key: "linkedin",
  },
  {
    label: "LCI blog",
    url: "https://www.lionsclubs.org/en/blog",
    icon_key: "blog",
  },
] as const;

export const defaultDescription =
  "Lewisport Lions Club serves Hancock County through vision and hearing programs, youth support, scholarships, and community events. Part of Lions Clubs International.";
