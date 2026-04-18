/**
 * Whether a link should open in a new tab (another origin / off-site web URL).
 * Same-origin absolute URLs stay in-tab. mailto:, tel:, #, and relative paths
 * are not forced to a new tab.
 */
export function leavesSiteForNewTab(href: string): boolean {
  const h = href.trim();
  if (!h || h.startsWith("#") || h.startsWith("?")) {
    return false;
  }
  // Single-slash app paths only; protocol-relative `//host` is off-site.
  if (h.startsWith("/") && !h.startsWith("//")) {
    return false;
  }
  if (/^(mailto|tel|sms):/i.test(h)) {
    return false;
  }

  let target: URL;
  try {
    target = h.startsWith("//")
      ? new URL(h, "https://placeholder.invalid")
      : new URL(h);
  } catch {
    return true;
  }

  if (target.protocol !== "http:" && target.protocol !== "https:") {
    return false;
  }

  const baseRaw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!baseRaw) {
    return true;
  }

  try {
    const site = new URL(baseRaw);
    return target.origin !== site.origin;
  } catch {
    return true;
  }
}
