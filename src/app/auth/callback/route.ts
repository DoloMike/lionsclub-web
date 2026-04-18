import { type NextRequest, NextResponse } from "next/server";

/**
 * OAuth callback route.
 *
 * After Google authenticates, Supabase redirects here with `?code=...&next=/`.
 * The browser-side Supabase client (createBrowserClient, which uses
 * detectSessionInUrl: true by default) picks up the auth code from the URL
 * and exchanges it for a session automatically. This mirrors the pattern
 * used in the IMI codebase.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const next = requestUrl.searchParams.get("next") ?? "/";
  const safeNext =
    next.startsWith("/") && !next.startsWith("//") ? next : "/";

  // Use x-forwarded-host to get the public-facing origin.
  // Inside Coolify, request.url uses the internal host (localhost:3000),
  // but nginx sets x-forwarded-host to the real public hostname.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  const origin = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : requestUrl.origin;

  return NextResponse.redirect(`${origin}${safeNext}`);
}
