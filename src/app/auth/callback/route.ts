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
 * OAuth callback: exchange the auth `code` on the server and attach session
 * cookies to the redirect response. That way the next request (e.g. `/admin`)
 * Server Components see a session — client-only exchange would run after SSR
 * and incorrectly redirect to `?error=forbidden`.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const oauthError = requestUrl.searchParams.get("error");
  const code = requestUrl.searchParams.get("code");
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
  const response = NextResponse.redirect(redirectUrl);

  const canExchange =
    Boolean(env.supabase.url && env.supabase.anonKey) && Boolean(code);

  if (!canExchange) {
    if (!code) {
      return response;
    }
    // No Supabase config: fall back to passing `code` through for client-only PKCE.
    for (const [key, value] of requestUrl.searchParams.entries()) {
      if (key === "next") continue;
      redirectUrl.searchParams.set(key, value);
    }
    return NextResponse.redirect(redirectUrl);
  }

  const authCode = code;
  if (!authCode) {
    return response;
  }

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
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(authCode);
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  return response;
}
