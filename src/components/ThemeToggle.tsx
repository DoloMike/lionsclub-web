"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

type ThemeChoice = "light" | "system" | "dark";

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

const SEGMENTS: {
  value: ThemeChoice;
  label: string;
  hint: string;
  Icon: typeof SunIcon;
}[] = [
  { value: "light", label: "Light", hint: "Always use light theme", Icon: SunIcon },
  {
    value: "system",
    label: "System",
    hint: "Match device setting",
    Icon: MonitorIcon,
  },
  { value: "dark", label: "Dark", hint: "Always use dark theme", Icon: MoonIcon },
];

type ThemeToggleProps = {
  className?: string;
};

/** Light / System / Dark as a single segmented control (no dropdown). */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const mounted = useIsClient();
  const { theme, setTheme } = useTheme();

  if (!mounted) {
    return (
      <div
        className={[
          "h-9 w-[5.25rem] shrink-0 rounded-md border border-border bg-muted/40",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        aria-hidden
      />
    );
  }

  const active = (theme ?? "system") as ThemeChoice;

  return (
    <div
      className={[
        "inline-flex h-9 shrink-0 rounded-md border border-border bg-muted/50 p-px shadow-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="radiogroup"
      aria-label="Color theme"
    >
      {SEGMENTS.map(({ value, label, hint, Icon }) => {
        const selected = active === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={label}
            title={hint}
            className={[
              "relative flex min-w-0 flex-1 items-center justify-center rounded-[0.2rem] px-2 py-1 transition-colors duration-200",
              selected
                ? "z-[1] bg-primary text-primary-foreground shadow-md"
                : "z-0 text-muted-foreground hover:bg-muted/70 hover:text-foreground",
            ].join(" ")}
            onClick={() => setTheme(value)}
          >
            <Icon className="h-4 w-4 shrink-0 sm:h-[1.125rem] sm:w-[1.125rem]" />
            <span className="sr-only">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
