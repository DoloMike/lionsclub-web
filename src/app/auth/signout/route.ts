import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";

function cookieDomain(): string | undefined {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) return undefined;
  const hostname = new URL(appUrl).hostname;
  return hostname === "localhost" ? undefined : hostname;
}

export async function POST(request: NextRequest) {
  // Use the public URL so sign-out clears the same auth cookie names that the
  // browser client, callback route, and SSR readers use.
  const url = env.supabase.url;
  const anonKey = env.supabase.anonKey;

  if (!env.supabase.url || !anonKey) {
    return NextResponse.json({ ok: true });
  }

  const response = NextResponse.json({ ok: true });

  const supabase = createServerClient(url, anonKey, {
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

  await supabase.auth.signOut();

  return response;
}
