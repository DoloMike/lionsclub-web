"use client";

import { HeaderAuthControls } from "@/components/auth/HeaderAuthControls";
import { MobileNav } from "@/components/MobileNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useSessionProfileState } from "@/components/auth/SessionProfileProvider";
import { Skeleton } from "@/components/ui/Skeleton";

export function HeaderAuthIsland() {
  const auth = useSessionProfileState();
  const showGuestTheme =
    auth.status === "ready" && auth.session === null;

  return (
    <div className="flex min-w-0 shrink-0 items-center justify-end gap-3">
      {auth.status === "loading" ? (
        <div
          className="hidden md:block"
          aria-busy="true"
          aria-label="Loading theme controls"
        >
          <Skeleton className="h-9 w-[6.625rem] shrink-0 rounded-md shadow-sm ring-1 ring-border/60" />
        </div>
      ) : showGuestTheme ? (
        <div className="hidden md:block">
          <ThemeToggle />
        </div>
      ) : null}
      <HeaderAuthControls />
      <MobileNav />
    </div>
  );
}
