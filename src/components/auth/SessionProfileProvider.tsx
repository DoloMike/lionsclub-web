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
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  // Surface real errors (RLS, network, timeout) so the caller can preserve
  // the prior known role instead of silently downgrading the user to guest.
  // A successful query that returns no row IS a guest — that's not an error.
  if (error) throw error;

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

  // Only authenticated users need the live `onAuthStateChange` listener
  // (cross-tab sign-out, role refresh after admin promote, etc.). Guests
  // become signed-in via a full-page OAuth round trip — the next server
  // render reads the new cookie and seeds `initial` with the session, at
  // which point this effect re-runs and attaches the listener.
  //
  // Keeping the effect short-circuited for guests means the entire Supabase
  // browser client (`@supabase/ssr` + `@supabase/supabase-js`, ~30 KB gz)
  // stays out of the guest bundle as a lazy chunk loaded on first need.
  const hasSession = initial.session !== null;

  useEffect(() => {
    if (!hasSession) return;

    let cancelled = false;
    let subscription: { unsubscribe: () => void } | undefined;

    void (async () => {
      const { createBrowserSupabaseClient } = await import(
        "@/lib/supabase/browser"
      );
      if (cancelled) return;
      const supabase = createBrowserSupabaseClient();

      const syncFromUser = async (user: User | null) => {
        if (!user) {
          setState({ status: "ready", session: null });
          return;
        }
        try {
          const session = await profileForUser(supabase, user);
          setState({ status: "ready", session });
        } catch (err) {
          // Don't downgrade to "guest" on a transient role lookup failure —
          // that's how an admin briefly saw themselves as a guest after
          // clicking around. Preserve the prior known role; if there is no
          // prior session yet, swallow the update so the SSR-seeded state
          // stays intact.
          console.error("SessionProfileProvider: role refresh failed", err);
          setState((prev) => {
            if (prev.session) {
              return {
                status: "ready",
                session: { user, role: prev.session.role },
              };
            }
            return prev;
          });
        }
      };

      const {
        data: { subscription: sub },
      } = supabase.auth.onAuthStateChange((event, nextSession) => {
        if (event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED") return;
        void syncFromUser(nextSession?.user ?? null);
      });
      subscription = sub;
      if (cancelled) sub.unsubscribe();
    })();

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
    };
  }, [hasSession]);

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
