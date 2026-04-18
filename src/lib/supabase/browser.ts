import { createBrowserClient } from "@supabase/ssr";
import { env } from "../env";

function publicCookieDomain(): string | undefined {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) return undefined;

  const hostname = new URL(appUrl).hostname;
  return hostname === "localhost" ? undefined : hostname;
}

function publicSupabaseUrl(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!env.supabase.url || !env.supabase.anonKey) {
    throw new Error("Supabase URL and anon key are required");
  }

  if (!appUrl) return env.supabase.url;

  const { hostname, origin } = new URL(appUrl);

  // In production/public environments, force browser auth traffic onto the
  // app origin so refresh/token calls stay same-origin and avoid PNA/CORS
  // issues against the separate db subdomain.
  if (hostname !== "localhost" && hostname !== "127.0.0.1") {
    return origin;
  }

  return env.supabase.url;
}

/** Browser / Client Components — anon key only. */
export function createBrowserSupabaseClient() {
  return createBrowserClient(publicSupabaseUrl(), env.supabase.anonKey, {
    auth: {
      detectSessionInUrl: true,
      flowType: "pkce",
    },
    cookieOptions: {
      path: "/",
      sameSite: "lax",
      secure: !env.isDevelopment,
      domain: publicCookieDomain(),
    },
  });
}
