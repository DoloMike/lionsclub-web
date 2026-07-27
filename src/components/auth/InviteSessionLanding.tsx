"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function InviteSessionLanding({ nextPath }: { nextPath: string }) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const supabase = createBrowserSupabaseClient();
      const hash = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");

      // Admin-generated Supabase invites use an implicit access-token
      // fragment instead of the PKCE code used by the site's Google sign-in.
      // Consume it explicitly so an invite also works in a fresh browser.
      const result =
        accessToken && refreshToken
          ? await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            })
          : await supabase.auth.getSession();

      // Do not leave one-time credentials visible in browser history.
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}`,
      );

      if (cancelled) return;

      if (result.error || !result.data.session) {
        setError(
          "This invitation is invalid or has expired. Ask an administrator for a new invitation.",
        );
        return;
      }

      window.location.replace(nextPath);
    })();

    return () => {
      cancelled = true;
    };
  }, [nextPath]);

  return (
    <div className="mx-auto w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-foreground">
        {error ? "Invitation could not be completed" : "Accepting invitation"}
      </h1>
      <p
        className={
          error
            ? "mt-2 text-sm text-destructive"
            : "mt-2 text-sm text-muted-foreground"
        }
        role={error ? "alert" : "status"}
      >
        {error ?? "Setting up your administrator access…"}
      </p>
      {error ? (
        <a
          href="/admin/login"
          className="mt-5 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Go to admin sign in
        </a>
      ) : null}
    </div>
  );
}
