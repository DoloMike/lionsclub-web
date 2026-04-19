import type { ElementType, HTMLAttributes, ReactNode } from "react";

const paddings = {
  none: "",
  sm: "p-5",
  md: "p-6",
  lg: "p-6 sm:p-8",
  xl: "p-8 sm:p-10",
} as const;

const elevations = {
  /** Flat — no shadow, just border. Useful for nested groupings. */
  flat: "shadow-none",
  /** Default warm-tinted card shadow. */
  resting: "shadow-card",
  /** Heavier card shadow used for "feature" panels (order form, hero side). */
  raised: "shadow-card-hover",
} as const;

const radii = {
  md: "rounded-lg",
  lg: "rounded-xl",
  xl: "rounded-2xl",
} as const;

export type CardProps = HTMLAttributes<HTMLElement> & {
  /** Internal padding. Default `lg` (p-6 sm:p-8). */
  padding?: keyof typeof paddings;
  elevation?: keyof typeof elevations;
  radius?: keyof typeof radii;
  /** Render as a different element (e.g. `<li>` or `<section>`). */
  as?: ElementType;
  /** Adds a subtle ring for hero / feature panels. */
  ring?: boolean;
  /** Adds the hover-lift treatment (use only when whole card is interactive). */
  interactive?: boolean;
  children: ReactNode;
};

/**
 * Standard surface for content panels. Replaces the
 * `rounded-2xl border border-border bg-card p-* shadow-*` recipe that was
 * duplicated across the home page program grid, hero side panel, order form,
 * membership CTA, login form, and Stripe return page.
 */
export function Card({
  padding = "lg",
  elevation = "resting",
  radius = "xl",
  ring = false,
  interactive = false,
  as: Tag = "div",
  className = "",
  children,
  ...rest
}: CardProps) {
  return (
    <Tag
      className={[
        "border border-border bg-card text-card-foreground",
        radii[radius],
        paddings[padding],
        elevations[elevation],
        ring ? "ring-1 ring-border/60" : "",
        interactive
          ? "transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </Tag>
  );
}
