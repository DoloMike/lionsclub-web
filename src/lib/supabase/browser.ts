import { createClient } from "@supabase/supabase-js";
import { env } from "../env";

// Browser-safe client (uses anon key, safe for Client Components)
export const supabase = createClient(env.supabase.url, env.supabase.anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
