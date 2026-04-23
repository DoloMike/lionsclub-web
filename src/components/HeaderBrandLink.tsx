"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/** Home brand link: from other routes navigates to `/`; on `/` scrolls to top. */
export function HeaderBrandLink({
  className,
  ariaLabel,
  children,
}: {
  className?: string;
  ariaLabel: string;
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <Link
      href="/"
      className={className}
      aria-label={ariaLabel}
      onClick={(e) => {
        if (pathname !== "/") return;
        e.preventDefault();
        // Direct coordinates (not behavior:"smooth") — smooth scroll can be
        // interrupted and stop short of 0 when user scrolls during animation.
        window.scrollTo(0, 0);
      }}
    >
      {children}
    </Link>
  );
}
