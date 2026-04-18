"use client";

import { useTheme } from "next-themes";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

type ThemeChoice = "system" | "light" | "dark";

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  );
}

function MonitorIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

const OPTIONS: { value: ThemeChoice; label: string; hint: string }[] = [
  { value: "system", label: "System", hint: "Match device setting" },
  { value: "light", label: "Light", hint: "Always use light theme" },
  { value: "dark", label: "Dark", hint: "Always use dark theme" },
];

type ThemeToggleProps = {
  className?: string;
  /** `start`: menu aligns to control’s left (footer / left-aligned). `end`: to control’s right (header). */
  menuAlign?: "start" | "end";
};

/** Appearance control: Light, Dark, or System (default). */
export function ThemeToggle({
  className,
  menuAlign = "end",
}: ThemeToggleProps = {}) {
  const menuId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const mounted = useIsClient();
  const { theme, setTheme, resolvedTheme } = useTheme();

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

  if (!mounted) {
    return (
      <div
        className="h-9 w-9 shrink-0 rounded-md border border-border bg-muted/40"
        aria-hidden
      />
    );
  }

  const active = (theme ?? "system") as ThemeChoice;
  const looksDark = resolvedTheme === "dark";

  const menuPosition =
    menuAlign === "start" ? "left-0" : "right-0";

  return (
    <div
      className={[
        "relative inline-flex w-fit shrink-0",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      ref={wrapRef}
    >
      <button
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-foreground shadow-sm transition hover:bg-muted"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? menuId : undefined}
        aria-label="Color theme"
        onClick={() => setOpen((o) => !o)}
      >
        {looksDark ? (
          <MoonIcon className="h-5 w-5" />
        ) : (
          <SunIcon className="h-5 w-5" />
        )}
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Color theme"
          className={`absolute ${menuPosition} z-50 mt-2 w-52 rounded-lg border border-border bg-card py-1 shadow-lg`}
        >
          {OPTIONS.map((opt) => {
            const selected = active === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                title={opt.hint}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground transition hover:bg-muted"
                onClick={() => {
                  setTheme(opt.value);
                  close();
                }}
              >
                {opt.value === "light" ? (
                  <SunIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : opt.value === "dark" ? (
                  <MoonIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <MonitorIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <span className="min-w-0 flex-1">{opt.label}</span>
                {selected ? (
                  <CheckIcon className="h-4 w-4 shrink-0 text-primary" />
                ) : (
                  <span className="h-4 w-4 shrink-0" aria-hidden />
                )}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
