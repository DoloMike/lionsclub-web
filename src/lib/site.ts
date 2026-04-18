/**
 * Chapter facts and placeholders. Replace NAP (name / address / phone) when stakeholders confirm.
 * @see docs/lewisport-lions-site-plan.md
 */
export const site = {
  name: "Lewisport Lions Club",
  shortName: "Lewisport Lions",
  location: "Lewisport, Hancock County, Kentucky",
  district: "District 43-K",
  lcifUrl: "https://www.lionsclubs.org/en/member-resource-center/lcif",
  eClubhouseUrl: "https://e-clubhouse.org/sites/lewisport/projects.php",
  /** Placeholder until officers confirm */
  meeting: {
    schedule: "Meeting schedule — contact us for current day and time",
    place: "Meeting location — to be announced",
  },
  contact: {
    email: "club@example.com",
    phone: "(000) 000-0000",
    /** Optional social — confirm before publishing */
    facebookUrl: null as string | null,
    twitterUrl: null as string | null,
  },
} as const;

export const defaultDescription =
  "Lewisport Lions Club serves Hancock County through vision and hearing programs, youth support, scholarships, and community events. Part of Lions Clubs International.";
