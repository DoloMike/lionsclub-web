"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { env } from "@/lib/env";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

/**
 * Shared client-side sign-out hook.
 *
 * Signs out Supabase in the browser, POSTs to /auth/signout to clear server
 * cookies, navigates to /, and refreshes the router.
 */
export function useSignOut() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const hasSupabase = Boolean(env.supabase.url && env.supabase.anonKey);

  const signOut = useCallback(async () => {
    if (!hasSupabase) return;
    setPending(true);
    try {
      const supabase = createBrowserSupabaseClient();
      await supabase.auth.signOut();
      await fetch("/auth/signout", {
        method: "POST",
        credentials: "include",
      });
      router.push("/");
      router.refresh();
    } finally {
      setPending(false);
    }
  }, [hasSupabase, router]);

  return { signOut, signOutPending: pending };
}
