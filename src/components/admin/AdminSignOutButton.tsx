"use client";

import { useSignOut } from "@/components/auth/useSignOut";
import { Spinner } from "@/components/ui/Spinner";

/**
 * Admin header sign-out button.
 *
 * Uses the shared `useSignOut` hook so we clear BOTH the server session cookies
 * and the Supabase browser client's local state (localStorage + in-memory).
 * The previous server-action form only cleared cookies, leaving the browser
 * client signed in — `SessionProfileProvider`'s state then stayed stuck on the
 * old session after redirect because `useState(initial)` doesn't re-seed.
 */
export function AdminSignOutButton() {
  const { signOut, signOutPending } = useSignOut();

  return (
    <button
      type="button"
      onClick={() => void signOut()}
      disabled={signOutPending}
      className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-muted disabled:opacity-50"
    >
      {signOutPending ? (
        <>
          <Spinner className="h-3.5 w-3.5 shrink-0" />
          <span>Signing out…</span>
        </>
      ) : (
        "Sign out"
      )}
    </button>
  );
}
