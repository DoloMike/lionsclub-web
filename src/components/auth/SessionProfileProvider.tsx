"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { SessionProfile } from "@/lib/auth/session-profile";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

/** Always `ready` — initial session comes from the server layout (no header skeleton flash). */
export type SessionProfileStatus = {
  status: "ready";
  session: SessionProfile | null;
};

const SessionProfileContext = createContext<SessionProfileStatus | null>(null);

async function profileForUser(
  supabase: SupabaseClient,
  user: User
): Promise<SessionProfile> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  return { user, role: profile?.role ?? "guest" };
}

export function SessionProfileProvider({
  initial,
  children,
}: {
  initial: SessionProfileStatus;
  children: ReactNode;
}) {
  const [state, setState] = useState<SessionProfileStatus>(initial);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    const syncFromUser = async (user: User | null) => {
      if (!user) {
        setState({ status: "ready", session: null });
        return;
      }
      try {
        const session = await profileForUser(supabase, user);
        setState({ status: "ready", session });
      } catch {
        setState({ status: "ready", session: { user, role: "guest" } });
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED") return;
      void syncFromUser(nextSession?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = useMemo(() => state, [state]);

  return (
    <SessionProfileContext.Provider value={value}>
      {children}
    </SessionProfileContext.Provider>
  );
}

export function useSessionProfileState(): SessionProfileStatus {
  const ctx = useContext(SessionProfileContext);
  if (!ctx) {
    throw new Error(
      "useSessionProfileState must be used within SessionProfileProvider"
    );
  }
  return ctx;
}
