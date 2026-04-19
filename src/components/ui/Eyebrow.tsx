import type { ReactNode } from "react";

type EyebrowProps = {
  children: ReactNode;
  /** When true, uses the brand primary color (e.g. above the hero H1). */
  tone?: "muted" | "primary";
  /** Render as `span` for inline contexts (e.g. inside flex rows). */
  as?: "p" | "span";
  className?: string;
};

/**
 * The small uppercase label that sits above section titles ("In our community",
 * "404", "Payment received", etc.). Centralized so the typographic recipe
 * (mono / xs / semibold / widest tracking) stays identical across the site.
 */
export function Eyebrow({
  children,
  tone = "muted",
  as: Tag = "p",
  className = "",
}: EyebrowProps) {
  return (
    <Tag
      className={[
        "font-mono text-xs font-semibold uppercase tracking-widest",
        tone === "primary" ? "text-primary" : "text-muted-foreground",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </Tag>
  );
}
