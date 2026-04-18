"use client";

import { useState } from "react";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function LoginPanel({
  error,
  message,
}: {
  error?: string | null;
  message?: string | null;
}) {
  const [pending, setPending] = useState(false);

  async function signInWithGoogle() {
    setPending(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const origin = window.location.origin;
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?next=/`,
        },
      });
      if (oauthError) {
        console.error(oauthError);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      {error === "oauth" ? (
        <p className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
          {message ?? "Google sign-in failed. Try again."}
        </p>
      ) : null}
      <p className="mb-6 text-sm text-muted-foreground">
        Use your Google account. You can also use{" "}
        <strong>Sign in with Google</strong> in the site header (including
        One Tap when it appears).
      </p>
      <GoogleSignInButton
        variant="full"
        pending={pending}
        onClick={() => void signInWithGoogle()}
      />
    </div>
  );
}
