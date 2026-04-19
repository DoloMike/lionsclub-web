"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/app/admin/(protected)/actions";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { useGoogleOAuthSignIn } from "@/components/auth/useGoogleOAuthSignIn";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { fieldClassName } from "@/components/ui/field";
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
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const { pending: oauthPending, signIn: signInWithGoogleOAuth } =
    useGoogleOAuthSignIn();

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

  return (
    <div className="mx-auto mt-8 w-full max-w-sm space-y-4">
      {banner ? (
        <div
          className="rounded-lg border border-warning-border bg-warning-bg px-4 py-3 text-sm text-warning-foreground"
          role="status"
        >
          {banner}
        </div>
      ) : null}
      <Card padding="xl">
        <h1 className="text-xl font-semibold text-foreground">Admin sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Email/password or Google (configure Google in Supabase first).
        </p>
        <GoogleSignInButton
          variant="full"
          className="mt-6"
          pending={oauthPending}
          disabled={pending}
          onClick={() => {
            setError(null);
            void signInWithGoogleOAuth("/admin");
          }}
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
              className={fieldClassName("mt-1")}
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
              className={fieldClassName("mt-1")}
            />
          </div>
          {error ? (
            <p
              className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {error}
            </p>
          ) : null}
          <Button
            type="submit"
            size="md"
            className="w-full"
            disabled={oauthPending}
            pending={pending}
            pendingLabel="Signing in…"
          >
            Sign in with email
          </Button>
        </form>
      </Card>
      {errorParam === "forbidden" ? (
        <form action={signOut}>
          <Button
            type="submit"
            variant="ghost"
            size="md"
            className="w-full text-muted-foreground hover:text-foreground"
          >
            Sign out
          </Button>
        </form>
      ) : null}
    </div>
  );
}
