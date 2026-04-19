"use client";

import { useCallback, useState } from "react";
import { env } from "@/lib/env";

/**
 * Shared Google OAuth redirect used by header + mobile drawer sign-in buttons.
 *
 * The Supabase browser client is dynamically imported on click so guest
 * pageviews don't pull `@supabase/ssr` + `@supabase/supabase-js` into the
 * shared bundle. The chunk loads after the user clicks "Sign in".
 */
export function useGoogleOAuthSignIn() {
  const [pending, setPending] = useState(false);

  const signIn = useCallback(async (nextPath?: string) => {
    if (!env.supabase.url || !env.supabase.anonKey) return;
    setPending(true);
    try {
      const { createBrowserSupabaseClient } = await import(
        "@/lib/supabase/browser"
      );
      const supabase = createBrowserSupabaseClient();
      const origin = window.location.origin;
      const next =
        nextPath ?? `${window.location.pathname}${window.location.search}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) console.error(error);
    } finally {
      setPending(false);
    }
  }, []);

  return { pending, signIn };
}
