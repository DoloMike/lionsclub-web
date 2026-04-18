"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  signOut,
} from "@/app/admin/(protected)/actions";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function LoginForm({
  error: errorParam,
  message: messageParam,
}: {
  error?: string | null;
  message?: string | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [oauthPending, setOauthPending] = useState(false);
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  const banner =
    errorParam === "forbidden"
      ? "This account doesn’t have admin access. Sign out and use a different account, or ask an officer to grant admin in Supabase."
      : errorParam === "oauth"
        ? messageParam ?? "Google sign-in failed."
        : null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");

    const { error: signError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setPending(false);

    if (signError) {
      setError(signError.message);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  async function signInWithGoogle() {
    setError(null);
    setOauthPending(true);
    const origin = window.location.origin;
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=/admin`,
      },
    });
    setOauthPending(false);
    if (oauthError) {
      setError(oauthError.message);
    }
  }

  return (
    <div className="mx-auto mt-8 w-full max-w-sm space-y-4">
      {banner ? (
        <div
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100"
          role="status"
        >
          {banner}
        </div>
      ) : null}
      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-foreground">Admin sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Email/password or Google (configure Google in Supabase first).
        </p>
        <button
          type="button"
          onClick={() => void signInWithGoogle()}
          disabled={oauthPending || pending}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted disabled:opacity-60"
        >
          {oauthPending ? (
            "Redirecting…"
          ) : (
            <>
              <GoogleGlyph />
              Continue with Google
            </>
          )}
        </button>
        <p className="my-4 text-center text-xs text-muted-foreground">or</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-foreground"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-foreground"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </div>
          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={pending || oauthPending}
            className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Signing in…" : "Sign in with email"}
          </button>
        </form>
      </div>
      {errorParam === "forbidden" ? (
        <form action={signOut}>
          <button
            type="submit"
            className="w-full rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            Sign out
          </button>
        </form>
      ) : null}
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
