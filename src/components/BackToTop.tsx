"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

function pathEnabled(pathname: string): boolean {
  if (pathname === "/") return true;
  if (pathname === "/fundraising" || pathname.startsWith("/fundraising/")) {
    return true;
  }
  return false;
}

export function BackToTop() {
  const pathname = usePathname();
  const [scrollY, setScrollY] = useState(0);
  const enabled = pathEnabled(pathname);

  useEffect(() => {
    if (!enabled) return;
    const onScroll = () => setScrollY(window.scrollY);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [enabled]);

  const visible = enabled && scrollY > 420;

  const goTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={goTop}
      className="fixed bottom-5 right-4 z-40 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-md ring-1 ring-border/60 transition hover:bg-muted md:bottom-8"
      aria-label="Back to top"
    >
      Back to top
    </button>
  );
}
