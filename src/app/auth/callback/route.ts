import { type NextRequest, NextResponse } from "next/server";

/**
 * OAuth callback: Supabase redirects here after Google auth.
 * We simply redirect back to the app and let the browser-side Supabase
 * client (detectSessionInUrl: true) complete the PKCE code exchange.
 *
 * Server-side exchange was tried but broke cookie hydration in production
 * due to internal URL / cookie domain mismatches. Browser-side exchange
 * is simpler and matches how IMI (working reference) handles it.
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

  // Preserve all params (code, state, etc.) so the browser client can
  // complete the PKCE exchange via detectSessionInUrl.
  const redirectUrl = new URL(`${origin}${safeNext}`);
  for (const [key, value] of requestUrl.searchParams.entries()) {
    if (key === "next") continue;
    redirectUrl.searchParams.set(key, value);
  }

  return NextResponse.redirect(redirectUrl);
}
