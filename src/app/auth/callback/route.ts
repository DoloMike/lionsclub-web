import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";

function cookieDomain(): string | undefined {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) return undefined;
  const hostname = new URL(appUrl).hostname;
  return hostname === "localhost" ? undefined : hostname;
}

/**
 * OAuth callback: exchange the auth code server-side so session cookies are
 * set before the next SSR render. Must use the PUBLIC Supabase URL (not the
 * internal one) so cookie names match what the browser client expects
 * (derived from the URL passed to createServerClient / createBrowserClient).
 *
 * After a successful exchange we redirect to /auth/complete (a minimal page
 * with no route prefetching) rather than directly to arbitrary app pages.
 * This avoids Next.js prefetch-triggered renders racing against session
 * cookie propagation. /auth/complete reads the `next` param and sends the
 * user onward once the session is established.
 *
 * Stale bad_oauth_state errors (e.g., from an expired state param used by
 * Google GSI sign-in popups) are non-destructive: if the user already has a
 * valid server session we redirect to /auth/complete instead of an error URL.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/";
  const safeNext =
    next.startsWith("/") && !next.startsWith("//") ? next : "/";

  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto =
    request.headers.get("x-forwarded-proto") ??
    requestUrl.protocol.replace(":", "");
  const origin = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : requestUrl.origin;

  const buildCompleteUrl = (overrideNext?: string) => {
    const url = new URL(`${origin}/auth/complete`);
    const nextToSend = overrideNext ?? safeNext;
    if (nextToSend !== "/") {
      url.searchParams.set("next", nextToSend);
    }
    return url;
  };

  const buildRedirectResponse = (url: URL | string) =>
    NextResponse.redirect(url, 303);

  if (!env.supabase.url || !env.supabase.anonKey) {
    return buildRedirectResponse(buildCompleteUrl());
  }

  let response = buildRedirectResponse(buildCompleteUrl());

  const supabase = createServerClient(env.supabase.url, env.supabase.anonKey, {
    cookieOptions: {
      path: "/",
      sameSite: "lax",
      secure: !env.isDevelopment,
      domain: cookieDomain(),
    },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      // @supabase/ssr v0.10 passes cache-control headers as the second arg so
      // auth / token-refresh responses are not cached by CDNs / proxies.
      setAll(cookiesToSet, headers) {
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        for (const [key, value] of Object.entries(headers)) {
          response.headers.set(key, value);
        }
      },
    },
  });

  const oauthError = requestUrl.searchParams.get("error");
  if (oauthError) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      response = buildRedirectResponse(buildCompleteUrl(safeNext));
      return response;
    }

    return buildRedirectResponse(`${origin}/login?error=oauth`);
  }

  if (!code) {
    return response;
  }

  response = buildRedirectResponse(buildCompleteUrl(safeNext));
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      response = buildRedirectResponse(buildCompleteUrl(safeNext));
      return response;
    }

    return buildRedirectResponse(`${origin}/login?error=oauth`);
  }

  return response;
}
