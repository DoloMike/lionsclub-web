import { type NextRequest, NextResponse } from "next/server";
import { env } from "lib/env";

const DEBUG_CODE = env.supabase.serviceRoleKey?.slice(0, 8) ?? "debug";

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
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/";
  const safeNext =
    next.startsWith("/") && !next.startsWith("//") ? next : "/";

  // Debug endpoint: ?debug=SRV_KEY_PREFIX returns JSON with parsed params
  const debug = requestUrl.searchParams.get("debug");
  if (debug === DEBUG_CODE) {
    const forwardedHost = request.headers.get("x-forwarded-host");
    const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
    return NextResponse.json(
      {
        hasCode: !!code,
        codePrefix: code ? code.slice(0, 12) + "..." : null,
        next: safeNext,
        forwardedHost,
        forwardedProto,
        origin: forwardedHost
          ? `${forwardedProto}://${forwardedHost}`
          : requestUrl.origin,
        cookieCount: request.cookies.getAll().length,
        cookieNames: request.cookies.getAll().map((c) => c.name),
        userAgent: request.headers.get("user-agent") ?? "unknown",
      },
      { status: 200 }
    );
  }

  console.log(
    `[AuthCallback] code=${code ? "present(" + code.slice(0, 12) + "...)" : "null"} next=${safeNext} url=${request.url}`
  );

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
