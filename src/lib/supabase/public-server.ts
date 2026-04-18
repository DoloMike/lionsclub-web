import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env, isSupabaseConfigured } from "../env";

/** Read-only anon client for public server components (no user session). */
export function createPublicServerClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }
  // Use internal URL for server-side requests to avoid Cloudflare round-trip
  const url = env.supabase.internalUrl || env.supabase.url;
  return createClient(url, env.supabase.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
