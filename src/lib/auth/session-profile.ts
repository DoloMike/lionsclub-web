import type { User } from "@supabase/supabase-js";

/** Server + client — session + chapter profile role. */
export type SessionProfile = {
  user: User;
  role: string;
};
