"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  signOut,
} from "@/app/admin/(protected)/actions";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
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
        <GoogleSignInButton
          variant="full"
          className="mt-6"
          pending={oauthPending}
          disabled={pending}
          onClick={() => void signInWithGoogle()}
        />
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
