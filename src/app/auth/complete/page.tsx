/**
 * Minimal post-auth landing page.
 *
 * The Supabase SSR advanced guide recommends redirecting through a single
 * dedicated page after sign-in rather than directly to arbitrary app pages,
 * because Next.js route prefetching can trigger auth-related rendering
 * before session cookies are fully propagated.
 *
 * This page exchanges the code server-side, waits for the session to be
 * established, then sends the user to the intended destination.
 *
 * Components that link here use `<a>` (not `<Link prefetch>`) to avoid
 * triggering Next.js prefetch logic that could cause hangs on slow auth.
 */

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { isSupabaseConfigured } from "@/lib/env";

interface AuthCompletePageProps {
  searchParams: Promise<{ next?: string; error?: string }>;
}

export default async function AuthCompletePage({
  searchParams,
}: AuthCompletePageProps) {
  const params = await searchParams;

  if (!isSupabaseConfigured()) {
    redirect("/");
  }

  // Exchange any pending auth code so cookies are set before we read the session.
  const supabase = await createSupabaseServerClient();
  await supabase.auth.getUser();

  const rawNext = params.next ?? "/";
  const safeNext =
    rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";

  if (params.error) {
    redirect(`/login?error=${encodeURIComponent(params.error)}`);
  }

  redirect(safeNext);
}