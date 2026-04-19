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
  const enabled = pathEnabled(pathname);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      setVisible(window.scrollY > 420);
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [enabled]);

  const goTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (!enabled || !visible) return null;

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
