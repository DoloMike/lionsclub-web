"use client";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { useEffect, useState } from "react";

export default function DebugSessionPage() {
  const [sessionInfo, setSessionInfo] = useState<string>("loading...");

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setSessionInfo(`ERROR: ${error.message}`);
      } else if (session) {
        setSessionInfo(
          `SESSION OK — user: ${session.user.email ?? session.user.id}, expires: ${session.expires_at ? new Date(session.expires_at * 1000).toISOString() : "none"}`
        );
      } else {
        setSessionInfo("NO SESSION — cookie check complete, no session found");
      }
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSessionInfo((prev) => `${prev}\nEVENT: ${event} — ${session ? "session:" + session.user.email : "null"}`);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h1>Auth Debug</h1>
      <pre>{sessionInfo}</pre>
    </div>
  );
}
