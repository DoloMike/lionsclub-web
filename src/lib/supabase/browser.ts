import { createBrowserClient } from "@supabase/ssr";
import { env } from "../env";

/** Browser / Client Components — anon key only. */
export function createBrowserSupabaseClient() {
  if (!env.supabase.url || !env.supabase.anonKey) {
    throw new Error("Supabase URL and anon key are required");
  }
  return createBrowserClient(env.supabase.url, env.supabase.anonKey);
}
