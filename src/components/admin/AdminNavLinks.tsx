"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/settings", label: "Meeting schedule" },
  { href: "/admin/social", label: "Social links" },
  { href: "/admin/officers", label: "Officers" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/fundraiser", label: "Fundraisers" },
  { href: "/admin/volunteer", label: "Volunteer sign-ups" },
  { href: "/admin/photos", label: "Photos" },
  { href: "/admin/admins", label: "Admins" },
] as const;

function adminNavClass(active: boolean): string {
  return active
    ? "rounded-md bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary"
    : "rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground";
}

function isAdminLinkActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNavLinks() {
  const pathname = usePathname() ?? "";

  return (
    <>
      {links.map((l) => {
        const active = isAdminLinkActive(pathname, l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={adminNavClass(active)}
            aria-current={active ? "page" : undefined}
          >
            {l.label}
          </Link>
        );
      })}
    </>
  );
}
