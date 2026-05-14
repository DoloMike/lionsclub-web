"use client";

import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { useGoogleOAuthSignIn } from "@/components/auth/useGoogleOAuthSignIn";

/**
 * Inline Google sign-in CTA used inside each shift row when no one is signed
 * in yet. Sending the shift anchor as `nextPath` brings the user back to the
 * same shift after OAuth so they don't have to scroll-hunt the right row.
 */
export function SignInToSignUpButton({ nextPath }: { nextPath: string }) {
  const { pending, signIn } = useGoogleOAuthSignIn();
  return (
    <GoogleSignInButton
      variant="compact"
      pending={pending}
      pendingLabel="Redirecting…"
      onClick={() => void signIn(nextPath)}
    >
      Sign in
    </GoogleSignInButton>
  );
}
