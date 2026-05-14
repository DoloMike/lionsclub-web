"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import type { SessionProfile } from "@/lib/auth/session-profile";
import { isAdminRole, isChapterMember, roleLabel } from "@/lib/auth/roles";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { useGoogleOAuthSignIn } from "@/components/auth/useGoogleOAuthSignIn";
import { useSessionProfileState } from "@/components/auth/SessionProfileProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useSignOut } from "@/components/auth/useSignOut";
import { Spinner } from "@/components/ui/Spinner";

function readMetaString(
  meta: User["user_metadata"],
  key: string,
): string | undefined {
  const v = meta?.[key];
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

function displayLabel(user: User): string {
  const full =
    readMetaString(user.user_metadata, "full_name") ??
    readMetaString(user.user_metadata, "name");
  if (full) return full;
  const email = user.email;
  if (email) {
    const local = email.split("@")[0];
    return local ?? email;
  }
  return "Account";
}

function initialsForUser(user: User): string {
  const full =
    readMetaString(user.user_metadata, "full_name") ??
    readMetaString(user.user_metadata, "name");
  if (full) {
    const parts = full.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      const a = parts[0]!.charAt(0);
      const b = parts[parts.length - 1]!.charAt(0);
      return (a + b).toUpperCase();
    }
    return full.slice(0, 2).toUpperCase();
  }
  const email = user.email;
  if (email) return email.slice(0, 2).toUpperCase();
  return "?";
}

function LoggedInAccountMenu({
  session,
  onSignOut,
  signOutPending,
}: {
  session: SessionProfile;
  onSignOut: () => void;
  signOutPending: boolean;
}) {
  const menuId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const user = session.user;
  const email = user.email ?? "";
  const label = displayLabel(user);
  const initials = initialsForUser(user);
  const admin = isAdminRole(session.role);
  const chapterMember = isChapterMember(session.role);
  const role = roleLabel(session.role);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e: MouseEvent) => {
      const el = wrapRef.current;
      if (el && !el.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open]);

  const close = useCallback(() => setOpen(false), []);

  return (
    <div className="relative shrink-0" ref={wrapRef}>
      <button
        type="button"
        className="flex max-w-[min(100vw-6rem,16rem)] items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-2 shadow-sm transition-[background-color,box-shadow,transform] duration-150 hover:bg-muted hover:shadow active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:max-w-[20rem] sm:pr-3"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((o) => !o)}
      >
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
          aria-hidden
        >
          {initials}
        </span>
        <span className="min-w-0 flex-1 text-left max-sm:sr-only">
          <span className="block truncate text-sm font-medium text-foreground">
            {label}
          </span>
          <span className="block text-xs text-muted-foreground">{role}</span>
        </span>
        <svg
          className={`h-4 w-4 shrink-0 text-muted-foreground transition ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Account"
          className="absolute right-0 z-50 mt-2 w-[min(calc(100vw-2rem),18rem)] origin-top-right rounded-lg border border-border bg-card py-1 shadow-popover animate-slide-down-in"
        >
          <div className="border-b border-border px-3 py-2.5">
            <p className="text-xs font-medium text-muted-foreground">Signed in as</p>
            <p className="mt-0.5 break-all text-sm text-foreground" title={email}>
              {email || "—"}
            </p>
            <p className="mt-2">
              <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                {role}
              </span>
            </p>
          </div>
          <div className="border-b border-border px-3 py-2.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Appearance
            </p>
            <div className="mt-2">
              <ThemeToggle />
            </div>
          </div>
          <div className="py-1">
            {admin ? (
              <Link
                href="/admin"
                role="menuitem"
                className="block px-3 py-2 text-sm text-foreground transition hover:bg-muted"
                onClick={close}
              >
                Admin
              </Link>
            ) : null}
            {!chapterMember ? (
              <Link
                href="/membership"
                role="menuitem"
                className="block px-3 py-2 text-sm text-foreground transition hover:bg-muted"
                onClick={close}
              >
                Become a member
              </Link>
            ) : null}
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground transition-colors duration-150 hover:bg-muted disabled:opacity-50"
              onClick={() => {
                close();
                onSignOut();
              }}
              disabled={signOutPending}
            >
              {signOutPending ? (
                <>
                  <Spinner className="h-3.5 w-3.5 shrink-0" />
                  <span>Signing out…</span>
                </>
              ) : (
                "Sign out"
              )}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function HeaderAuthControls() {
  const auth = useSessionProfileState();
  const { pending: oauthPending, signIn: signInWithGoogleOAuth } =
    useGoogleOAuthSignIn();
  const { signOut, signOutPending } = useSignOut();

  const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!hasSupabase) {
    return null;
  }

  const session = auth.session;

  if (session) {
    return (
      <LoggedInAccountMenu
        session={session}
        onSignOut={() => void signOut()}
        signOutPending={signOutPending}
      />
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="hidden lg:flex lg:items-center">
        <GoogleSignInButton
          variant="compact"
          pending={oauthPending}
          pendingLabel="Signing in…"
          onClick={() => {
            if (!hasSupabase) return;
            void signInWithGoogleOAuth();
          }}
        >
          {/* Brand wordmark + 6 nav items + auth control is a tight squeeze even at xl,
              so keep the label to "Sign in" — the G-mark conveys the provider. */}
          Sign in
        </GoogleSignInButton>
      </div>
    </div>
  );
}
