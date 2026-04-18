import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Paths that should skip session refresh to avoid rate limiting the auth server
const AUTH_SKIP_PATHS = [
  "/auth/callback",
  "/_rsc",
  "/_next",
];

function shouldSkipAuth(pathname: string): boolean {
  return AUTH_SKIP_PATHS.some(
    (p) => pathname.startsWith(p) || pathname === p
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth for callback, RSC, and Next.js internals — avoid hammering
  // the Supabase auth server with getUser() calls on every RSC prefetch.
  if (shouldSkipAuth(pathname)) {
    return NextResponse.next({ request });
  }

  const supabaseResponse = NextResponse.next({
    request,
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
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

  const supabase = createServerClient(url, anonKey, {
    cookieOptions: {
      path: "/",
      sameSite: "lax",
      secure: true,
      domain: appHostname,
    },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
