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
      className="fixed bottom-5 right-4 z-40 inline-flex items-center gap-1.5 rounded-full border border-border bg-card/85 px-4 py-2.5 text-sm font-medium text-foreground shadow-popover ring-1 ring-border/60 backdrop-blur transition-[background-color,box-shadow,transform] duration-150 hover:bg-card hover:shadow-card-hover active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background animate-slide-up-in md:bottom-8 md:right-6"
      aria-label="Back to top"
    >
      <svg
        className="h-3.5 w-3.5"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M10 16V4M4 10l6-6 6 6" />
      </svg>
      <span>Back to top</span>
    </button>
  );
}
