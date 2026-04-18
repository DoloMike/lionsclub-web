import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { env, isSupabaseConfigured } from "@/lib/env";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const appOrigin = process.env.NEXT_PUBLIC_APP_URL
    ? new URL(process.env.NEXT_PUBLIC_APP_URL).origin
    : url.origin;

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(new URL("/", appOrigin));
  }

  const code = url.searchParams.get("code");
  const nextRaw = url.searchParams.get("next") ?? "/";
  const safeNext =
    nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/";

  if (code) {
    const cookieStore = await cookies();
    const appHostname = new URL(appOrigin).hostname;
    const supabase = createServerClient(
      env.supabase.url,
      env.supabase.anonKey,
      {
        cookieOptions: {
          path: "/",
          sameSite: "lax",
          secure: !env.isDevelopment,
          domain: appHostname === "localhost" ? undefined : appHostname,
        },
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const login = new URL("/login", appOrigin);
      login.searchParams.set("error", "oauth");
      login.searchParams.set("message", error.message);
      return NextResponse.redirect(login);
    }
  }

  return NextResponse.redirect(new URL(safeNext, appOrigin));
}
