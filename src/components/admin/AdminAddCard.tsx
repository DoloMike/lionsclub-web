import type { ReactNode } from "react";

/**
 * Standard "Add <thing>" panel used on admin list pages. Collapsible to keep
 * the page calm once the section has rows in it; expands automatically when
 * the list is empty so first-time admins don't have to hunt for the form.
 *
 * Render the form (or any creation UI) as `children`. The wrapper provides
 * the card chrome, divider, padding, and title affordance.
 */
export function AdminAddCard({
  title,
  defaultOpen = false,
  description,
  children,
}: {
  title: string;
  /** Defaults to `false`. Pass `list.length === 0` for "open when empty". */
  defaultOpen?: boolean;
  /** Optional helper text shown above the form fields. */
  description?: string;
  children: ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className="group mt-10 rounded-lg border border-border bg-card"
    >
      <summary
        className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-lg px-5 py-4 text-base font-semibold text-foreground transition hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background [&::-webkit-details-marker]:hidden"
      >
        <span>{title}</span>
        <svg
          className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-150 group-open:rotate-90"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 5l6 5-6 5" />
        </svg>
      </summary>
      <div className="space-y-4 border-t border-border px-5 py-5">
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
        {children}
      </div>
    </details>
  );
}
