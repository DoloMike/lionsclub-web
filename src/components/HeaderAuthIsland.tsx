"use client";

import { HeaderAuthControls } from "@/components/auth/HeaderAuthControls";
import { MobileNav } from "@/components/MobileNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useSessionProfileState } from "@/components/auth/SessionProfileProvider";

export function HeaderAuthIsland() {
  const auth = useSessionProfileState();
  const showGuestTheme = auth.session === null;

  return (
    <div className="flex min-w-0 shrink-0 items-center justify-end gap-3">
      {showGuestTheme ? (
        <div className="hidden md:block">
          <ThemeToggle />
        </div>
      ) : null}
      <HeaderAuthControls />
      <MobileNav />
    </div>
  );
}
