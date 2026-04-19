import type { ReactNode } from "react";

type EmptyStateProps = {
  /** Big, optimistic headline. Required. */
  title: string;
  /** Supporting copy explaining the state and what happens next. */
  description?: ReactNode;
  /** CTA buttons (use `<ButtonLink>` / `<Button>`). Rendered in a wrapped row. */
  actions?: ReactNode;
  className?: string;
};

/**
 * Friendly "nothing here yet" panel. Centralizes the dashed-border + muted
 * background recipe so empty Events / Fundraising / Admin lists feel
 * intentional instead of broken.
 */
export function EmptyState({
  title,
  description,
  actions,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={[
        "rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <p className="text-base font-semibold text-foreground">{title}</p>
      {description ? (
        <div className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          {description}
        </div>
      ) : null}
      {actions ? (
        <div className="mt-6 flex flex-wrap justify-center gap-3">{actions}</div>
      ) : null}
    </div>
  );
}
