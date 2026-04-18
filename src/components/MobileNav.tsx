"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { useGoogleOAuthSignIn } from "@/components/auth/useGoogleOAuthSignIn";
import type { SessionProfile } from "@/lib/auth/session-profile";
import { isAdminRole, isChapterMember } from "@/lib/auth/roles";
import { env } from "@/lib/env";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { isNavHrefActive, mainNav, mobileNavLinkClassName } from "@/lib/nav";
import { ThemeToggle } from "@/components/ThemeToggle";

function getFocusable(panel: HTMLElement): HTMLElement[] {
  return Array.from(
    panel.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")
  );
}

export function MobileNav({ session }: { session: SessionProfile | null }) {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);
  const [signOutPending, setSignOutPending] = useState(false);
  const { pending: googlePending, signIn } = useGoogleOAuthSignIn();
  const hasSupabase = Boolean(env.supabase.url && env.supabase.anonKey);
  const admin = session ? isAdminRole(session.role) : false;
  const chapterMember = session ? isChapterMember(session.role) : false;

  const signOut = useCallback(async () => {
    if (!hasSupabase) return;
    setSignOutPending(true);
    try {
      const supabase = createBrowserSupabaseClient();
      await supabase.auth.signOut();
      router.refresh();
    } finally {
      setSignOutPending(false);
    }
  }, [hasSupabase, router]);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  const prevOpenRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (prevOpenRef.current && !open) {
      menuButtonRef.current?.focus();
    }
    prevOpenRef.current = open;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;

    const focusables = getFocusable(panel);
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    requestAnimationFrame(() => first?.focus());

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || focusables.length === 0) return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    panel.addEventListener("keydown", onKeyDown);
    return () => panel.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="flex shrink-0 items-center md:hidden">
      <button
        ref={menuButtonRef}
        type="button"
        className={
          open
            ? "inline-flex items-center justify-center rounded-md border-2 border-primary bg-background px-3 py-2 text-sm font-semibold text-foreground shadow-md ring-2 ring-primary/25 transition hover:bg-muted"
            : "inline-flex items-center justify-center rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted"
        }
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden
        >
          {open ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>
      {open ? (
        <>
          {/* Below the sticky header only — a full-screen inset-0 layer sat above the logo
              (later in DOM + z-30) and made the bar + close control look grayed out. */}
          <div
            className="fixed inset-x-0 bottom-0 top-14 z-30 bg-black/40 sm:top-16"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <nav
            ref={panelRef}
            id="mobile-nav-panel"
            className="fixed inset-x-0 top-14 z-50 flex max-h-[calc(100dvh-3.5rem)] flex-col overflow-hidden border-b border-border bg-card shadow-lg sm:top-16"
            aria-label="Mobile"
          >
            <div className="min-h-0 overflow-y-auto">
              <ul className="flex flex-col gap-1 px-4 py-4">
                {mainNav.map((item) => {
                  const active = isNavHrefActive(pathname, item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={mobileNavLinkClassName(active)}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setOpen(false)}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="shrink-0 space-y-4 border-t border-border bg-muted/20 px-4 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Appearance
                </p>
                <div className="mt-2">
                  <ThemeToggle menuAlign="start" />
                </div>
              </div>
              {session && hasSupabase ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Account
                  </p>
                  <ul className="mt-2 flex flex-col gap-1">
                    {admin ? (
                      <li>
                        <Link
                          href="/admin"
                          className={mobileNavLinkClassName(
                            isNavHrefActive(pathname, "/admin"),
                          )}
                          aria-current={
                            isNavHrefActive(pathname, "/admin")
                              ? "page"
                              : undefined
                          }
                          onClick={() => setOpen(false)}
                        >
                          Admin
                        </Link>
                      </li>
                    ) : null}
                    {!chapterMember ? (
                      <li>
                        <Link
                          href="/membership"
                          className={mobileNavLinkClassName(
                            isNavHrefActive(pathname, "/membership"),
                          )}
                          aria-current={
                            isNavHrefActive(pathname, "/membership")
                              ? "page"
                              : undefined
                          }
                          onClick={() => setOpen(false)}
                        >
                          Become a member
                        </Link>
                      </li>
                    ) : null}
                    <li>
                      <button
                        type="button"
                        className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-foreground hover:bg-muted disabled:opacity-50"
                        disabled={signOutPending}
                        onClick={() => {
                          void signOut();
                          setOpen(false);
                        }}
                      >
                        {signOutPending ? "Signing out…" : "Sign out"}
                      </button>
                    </li>
                  </ul>
                </div>
              ) : null}
              {!session && hasSupabase ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Account
                  </p>
                  <GoogleSignInButton
                    variant="full"
                    className="mt-2 w-full"
                    pending={googlePending}
                    pendingLabel="Signing in…"
                    onClick={() => {
                      void signIn();
                      setOpen(false);
                    }}
                  >
                    Sign in with Google
                  </GoogleSignInButton>
                </div>
              ) : null}
            </div>
          </nav>
        </>
      ) : null}
    </div>
  );
}
