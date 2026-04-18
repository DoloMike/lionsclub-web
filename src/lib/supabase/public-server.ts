import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env, isSupabaseConfigured } from "../env";

/** Read-only anon client for public server components (no user session). */
export function createPublicServerClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }
  return createClient(env.supabase.url, env.supabase.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
