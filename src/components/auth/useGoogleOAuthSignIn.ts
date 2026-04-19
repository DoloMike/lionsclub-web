"use client";

import { useCallback, useState } from "react";
import { env } from "@/lib/env";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

/**
 * Shared Google OAuth redirect used by header + mobile drawer sign-in buttons.
 * GSI / One Tap script stays in `HeaderAuthControls` (single mount).
 */
export function useGoogleOAuthSignIn() {
  const [pending, setPending] = useState(false);

  const signIn = useCallback(async () => {
    if (!env.supabase.url || !env.supabase.anonKey) return;
    const supabase = createBrowserSupabaseClient();
    const origin = window.location.origin;
    setPending(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(window.location.pathname + window.location.search)}`,
        },
      });
      if (error) console.error(error);
    } finally {
      setPending(false);
    }
  }, []);

  return { pending, signIn };
}
