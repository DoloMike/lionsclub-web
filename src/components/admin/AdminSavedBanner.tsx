"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

/** Shows after server actions redirect with `?saved=1`; clears the query param. */
export function AdminSavedBanner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const cleared = useRef(false);

  const saved = searchParams.get("saved") === "1";

  useEffect(() => {
    if (!saved || cleared.current) return;
    cleared.current = true;
    const t = window.setTimeout(() => {
      const url = new URL(window.location.href);
      url.searchParams.delete("saved");
      router.replace(url.pathname + url.search, { scroll: false });
    }, 4500);
    return () => window.clearTimeout(t);
  }, [saved, router]);

  if (!saved) return null;

  return (
    <div
      className="mb-6 flex items-center gap-2 rounded-lg border border-primary/25 bg-primary/5 px-4 py-3 text-sm text-foreground animate-slide-down-in"
      role="status"
    >
      <svg
        className="h-4 w-4 shrink-0 text-primary"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden
      >
        <path
          fillRule="evenodd"
          d="M16.704 5.296a1 1 0 010 1.408l-7.5 7.5a1 1 0 01-1.408 0l-3.5-3.5a1 1 0 111.408-1.408L8.5 12.092l6.796-6.796a1 1 0 011.408 0z"
          clipRule="evenodd"
        />
      </svg>
      <span>
        <strong className="text-primary">Saved.</strong> Changes are live on the
        public site.
      </span>
    </div>
  );
}
