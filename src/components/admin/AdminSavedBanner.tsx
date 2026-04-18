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
      className="mb-6 rounded-lg border border-primary/25 bg-primary/5 px-4 py-3 text-sm text-foreground"
      role="status"
    >
      <strong className="text-primary">Saved.</strong> Changes are live on the
      public site.
    </div>
  );
}
