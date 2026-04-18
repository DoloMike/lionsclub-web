import { createBrowserClient } from "@supabase/ssr";
import { env } from "../env";

function publicCookieDomain(): string | undefined {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) return undefined;

  const hostname = new URL(appUrl).hostname;
  return hostname === "localhost" ? undefined : hostname;
}

/** Browser / Client Components — anon key only. */
export function createBrowserSupabaseClient() {
  if (!env.supabase.url || !env.supabase.anonKey) {
    throw new Error("Supabase URL and anon key are required");
  }
  return createBrowserClient(env.supabase.url, env.supabase.anonKey, {
    cookieOptions: {
      path: "/",
      sameSite: "lax",
      secure: !env.isDevelopment,
      domain: publicCookieDomain(),
    },
  });
}
