import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { env } from "../env";

function publicCookieDomain(): string | undefined {
  // Avoid setting a production cookie domain while the tab is on localhost.
  if (typeof window !== "undefined") {
    const h = window.location.hostname;
    if (h === "localhost" || h === "127.0.0.1") {
      return undefined;
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) return undefined;

  const hostname = new URL(appUrl).hostname;
  return hostname === "localhost" || hostname === "127.0.0.1"
    ? undefined
    : hostname;
}

function publicSupabaseUrl(): string {
  if (!env.supabase.url || !env.supabase.anonKey) {
    throw new Error("Supabase URL and anon key are required");
  }

  // Local dev: if NEXT_PUBLIC_APP_URL still points at production, using that origin
  // for the Supabase client breaks auth (wrong host / CORS). Use the project URL.
  if (typeof window !== "undefined") {
    const h = window.location.hostname;
    if (h === "localhost" || h === "127.0.0.1") {
      return env.supabase.url;
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
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

let _browserClient: SupabaseClient | null = null;

/** Browser / Client Components — anon key only. Singleton to avoid duplicate listeners. */
export function createBrowserSupabaseClient(): SupabaseClient {
  if (_browserClient) return _browserClient;
  _browserClient = createBrowserClient(publicSupabaseUrl(), env.supabase.anonKey, {
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
  return _browserClient;
}

/** Test-only: clear the cached singleton between tests that don't `vi.resetModules()`. */
export function __resetBrowserSupabaseClient(): void {
  _browserClient = null;
}
