"use client";

import { startTransition, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { env } from "@/lib/env";

/**
 * Shared client-side sign-out hook.
 *
 * POST /auth/signout first so session cookies are cleared in one same-origin
 * round trip. A global `signOut()` on the browser client would also hit
 * Supabase remotely — doing that before the POST made sign-out feel slow.
 * We finish with `signOut({ scope: "local" })` only to reset in-memory client
 * state without another network call.
 *
 * The Supabase browser client is dynamically imported so guest pageviews
 * don't pull `@supabase/ssr` + `@supabase/supabase-js` into the shared bundle.
 * The chunk loads when an authenticated user actually clicks Sign out.
 */
export function useSignOut() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const hasSupabase = Boolean(env.supabase.url && env.supabase.anonKey);

  const signOut = useCallback(async () => {
    if (!hasSupabase) return;
    setPending(true);
    try {
      try {
        await fetch("/auth/signout", {
          method: "POST",
          credentials: "include",
          keepalive: true,
        });
      } catch {
        // Offline / aborted — still wipe local client state below.
      }
      const { createBrowserSupabaseClient } = await import(
        "@/lib/supabase/browser"
      );
      const supabase = createBrowserSupabaseClient();
      await supabase.auth.signOut({ scope: "local" });
      startTransition(() => {
        router.replace("/");
        router.refresh();
      });
    } finally {
      setPending(false);
    }
  }, [hasSupabase, router]);

  return { signOut, signOutPending: pending };
}
