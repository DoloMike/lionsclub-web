import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  });

  // Use the PUBLIC URL so the cookie key prefix matches what the browser client
  // and callback route use (both derived from NEXT_PUBLIC_SUPABASE_URL).
  // Cookie names are URL-derived; using internal URL here would cause the
  // middleware to read different cookie keys than the callback set.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !anonKey) {
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
      secure: process.env.NODE_ENV === "production",
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
