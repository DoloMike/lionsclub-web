"use client";

import { signOut } from "@/app/admin/(protected)/actions";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { useGoogleOAuthSignIn } from "@/components/auth/useGoogleOAuthSignIn";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function LoginForm({
  error: errorParam,
  message: messageParam,
}: {
  error?: string | null;
  message?: string | null;
}) {
  const { pending: oauthPending, signIn: signInWithGoogleOAuth } =
    useGoogleOAuthSignIn();

  const banner =
    errorParam === "forbidden"
      ? "This account doesn’t have admin access. Sign out and use a different account, or ask an officer to grant admin in Supabase."
      : errorParam === "oauth"
        ? messageParam ?? "Google sign-in failed."
        : null;

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
        <h1 className="text-xl font-semibold text-foreground">Admin Sign In</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in with your Google account.
        </p>
        <GoogleSignInButton
          variant="full"
          className="mt-6"
          pending={oauthPending}
          onClick={() => {
            void signInWithGoogleOAuth("/admin");
          }}
        />
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
