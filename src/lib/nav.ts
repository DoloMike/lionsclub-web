export const mainNav = [
  { href: "/about", label: "About" },
  { href: "/service", label: "Service" },
  { href: "/events", label: "Events" },
  { href: "/fundraising", label: "Fundraising" },
  { href: "/membership", label: "Membership" },
  { href: "/contact", label: "Contact" },
] as const;

/** True when `pathname` is this nav item or a nested route (e.g. `/fundraising/order`). */
export function isNavHrefActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href !== "/" && pathname.startsWith(`${href}/`)) return true;
  return false;
}

export function navLinkClassName(active: boolean): string {
  return active
    ? "rounded-md bg-primary/10 px-2.5 py-2 text-sm font-semibold text-primary"
    : "rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground";
}

export function mobileNavLinkClassName(active: boolean): string {
  return active
    ? "block rounded-md bg-primary/10 px-3 py-2 text-base font-semibold text-primary"
    : "block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted";
}
