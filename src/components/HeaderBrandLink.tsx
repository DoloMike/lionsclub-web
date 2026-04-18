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
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    >
      {children}
    </Link>
  );
}
