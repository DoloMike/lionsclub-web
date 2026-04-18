"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNavHrefActive, mainNav, navLinkClassName } from "@/lib/nav";

export function MainNavLinks() {
  const pathname = usePathname() ?? "";

  return (
    <>
      {mainNav.map((item) => {
        const active = isNavHrefActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={navLinkClassName(active)}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
