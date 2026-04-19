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
    return NextResponse.redirect(`${origin}/login?error=oauth`, 303);
  }

  const redirectUrl = new URL(`${origin}${safeNext}`);
  const response = NextResponse.redirect(redirectUrl, 303);

  if (!code || !env.supabase.url || !env.supabase.anonKey) {
    return response;
  }

  // Use the PUBLIC URL so cookie names match the browser Supabase client
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

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=oauth`, 303);
  }

  return response;
}
