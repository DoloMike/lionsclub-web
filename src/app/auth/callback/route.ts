import { type NextRequest, NextResponse } from "next/server";

/**
 * OAuth callback: preserve the `code` query string and hand control back to the
 * browser on the final app origin. The browser Supabase client then performs
 * the PKCE code exchange using its stored verifier.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const oauthError = requestUrl.searchParams.get("error");
  const next = requestUrl.searchParams.get("next") ?? "/";
  const safeNext =
    next.startsWith("/") && !next.startsWith("//") ? next : "/";

  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  const origin = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : requestUrl.origin;

  if (oauthError) {
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  const redirectUrl = new URL(`${origin}${safeNext}`);
  for (const [key, value] of requestUrl.searchParams.entries()) {
    if (key === "next") continue;
    redirectUrl.searchParams.set(key, value);
  }

  return NextResponse.redirect(redirectUrl);
}
