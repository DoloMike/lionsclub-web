import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "../env";

// Server-only client (uses service role key — never import in Client Components)
export const supabaseAdmin = createClient(
  env.supabase.url,
  env.supabase.serviceRoleKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
