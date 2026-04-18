/** Canonical origin for metadata, JSON-LD, sitemap, and robots (no trailing slash). */
export function getPublicSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
    /\/$/,
    ""
  );
}
