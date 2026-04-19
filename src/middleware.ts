import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  });

  // Use the PUBLIC URL so the cookie key prefix matches what the browser client
  // and callback route use (both derived from NEXT_PUBLIC_SUPABASE_URL).
  // Cookie names are URL-derived; using internal URL would cause the
  // middleware to read different cookie keys than the callback set.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  if (!url || !anonKey) {
    return supabaseResponse;
  }

  const appHostname = (() => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) return undefined;
    const hostname = new URL(appUrl).hostname;
    return hostname === "localhost" ? undefined : hostname;
  })();

  const mayHaveSession = request.cookies
    .getAll()
    .some(({ name }) => name.startsWith("sb-"));

  if (!mayHaveSession) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, anonKey, {
    cookieOptions: {
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      domain: appHostname,
    },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      // @supabase/ssr v0.10 passes cache-control headers as the second arg so
      // auth / token-refresh responses are not cached by CDNs / proxies.
      setAll(cookiesToSet, headers) {
        for (const { name, value, options } of cookiesToSet) {
          supabaseResponse.cookies.set(name, value, options);
        }
        for (const [key, value] of Object.entries(headers)) {
          supabaseResponse.headers.set(key, value);
        }
      },
    },
  });

  // Prefer session over getUser — fewer forced round-trips when JWT is still valid.
  await supabase.auth.getSession();

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Static assets, APIs, SEO — skip middleware. Page navigations + auth routes still run.
    "/((?!api/|_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
