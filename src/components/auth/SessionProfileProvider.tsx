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

export type SessionProfileStatus =
  | { status: "loading" }
  | { status: "ready"; session: SessionProfile | null };

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

export function SessionProfileProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionProfileStatus>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    let subscription: { unsubscribe: () => void } | undefined;

    void import("@/lib/supabase/browser").then(({ createBrowserSupabaseClient }) => {
      if (cancelled) return;
      const supabase = createBrowserSupabaseClient();

      const syncFromUser = async (user: User | null) => {
        if (cancelled) return;
        if (!user) {
          setState({ status: "ready", session: null });
          return;
        }
        try {
          const session = await profileForUser(supabase, user);
          if (!cancelled) setState({ status: "ready", session });
        } catch {
          if (!cancelled) {
            setState({ status: "ready", session: { user, role: "guest" } });
          }
        }
      };

      void (async () => {
        const {
          data: { session: initial },
        } = await supabase.auth.getSession();
        if (cancelled) return;
        await syncFromUser(initial?.user ?? null);
        if (cancelled) return;

        const {
          data: { subscription: sub },
        } = supabase.auth.onAuthStateChange((event, nextSession) => {
          if (event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED") return;
          void syncFromUser(nextSession?.user ?? null);
        });
        subscription = sub;
        if (cancelled) sub.unsubscribe();
      })();
    });

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
    };
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
