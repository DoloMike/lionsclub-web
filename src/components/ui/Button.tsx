import Link from "next/link";
import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { Spinner } from "@/components/ui/Spinner";

/**
 * Shared visual / interactive surface for every CTA in the app. The single
 * source of truth for hover, active, focus, and disabled states; centralizing
 * this killed ~40 duplicate class strings and lets us tune polish (e.g.
 * `active:scale`, `bg-primary/90` instead of the old `opacity-90` washout)
 * in one place.
 */
const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold " +
  "transition-[background-color,box-shadow,transform,opacity,border-color,color] duration-150 ease-out " +
  "active:scale-[0.985] " +
  "disabled:pointer-events-none disabled:opacity-50 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
  "aria-busy:cursor-progress";

const variants = {
  primary:
    "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md active:bg-primary/85",
  secondary:
    "border border-border bg-card text-card-foreground shadow-sm hover:bg-muted hover:shadow",
  ghost:
    "text-foreground hover:bg-muted",
  link:
    "h-auto rounded-none px-0 py-0 font-semibold text-primary underline-offset-4 hover:underline shadow-none",
} as const;

const sizes = {
  sm: "h-9 px-4 py-2 text-sm",
  md: "h-10 px-5 py-2.5 text-sm",
  lg: "h-12 px-6 py-3 text-sm",
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

export function buttonClassName({
  variant = "primary",
  size = "md",
  className = "",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}): string {
  // `link` variant is text-only — skip size padding to keep inline links inline.
  const sizeClasses = variant === "link" ? "" : sizes[size];
  return `${base} ${variants[variant]} ${sizeClasses} ${className}`.trim();
}

type ButtonOwnProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** When true, renders a small inline spinner before children and sets aria-busy. */
  pending?: boolean;
  /** Optional label shown while `pending` is true (defaults to children). */
  pendingLabel?: ReactNode;
  /** Optional leading icon (rendered before children, hidden during pending). */
  leadingIcon?: ReactNode;
  /** Optional trailing icon (rendered after children, hidden during pending). */
  trailingIcon?: ReactNode;
};

export type ButtonProps = ButtonOwnProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
    type?: "button" | "submit" | "reset";
  };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    pending = false,
    pendingLabel,
    leadingIcon,
    trailingIcon,
    className = "",
    disabled,
    type = "button",
    children,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClassName({ variant, size, className })}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      {...rest}
    >
      {pending ? (
        <>
          <Spinner className="h-4 w-4" />
          <span>{pendingLabel ?? children}</span>
        </>
      ) : (
        <>
          {leadingIcon ? <span aria-hidden>{leadingIcon}</span> : null}
          {children}
          {trailingIcon ? <span aria-hidden>{trailingIcon}</span> : null}
        </>
      )}
    </button>
  );
});

export type ButtonLinkProps = ButtonOwnProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, "className"> & {
    className?: string;
  };

export function ButtonLink({
  variant = "primary",
  size = "md",
  pending = false,
  pendingLabel,
  leadingIcon,
  trailingIcon,
  className = "",
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link
      className={buttonClassName({ variant, size, className })}
      aria-busy={pending || undefined}
      {...rest}
    >
      {pending ? (
        <>
          <Spinner className="h-4 w-4" />
          <span>{pendingLabel ?? children}</span>
        </>
      ) : (
        <>
          {leadingIcon ? <span aria-hidden>{leadingIcon}</span> : null}
          {children}
          {trailingIcon ? <span aria-hidden>{trailingIcon}</span> : null}
        </>
      )}
    </Link>
  );
}

/**
 * For when we need a real anchor (mailto:, tel:, target=_blank etc.) styled
 * like a button. Uses the same class string so visuals stay locked together.
 */
export type ButtonAnchorProps = ButtonOwnProps &
  AnchorHTMLAttributes<HTMLAnchorElement>;

export const ButtonAnchor = forwardRef<HTMLAnchorElement, ButtonAnchorProps>(
  function ButtonAnchor(
    {
      variant = "primary",
      size = "md",
      pending = false,
      pendingLabel,
      leadingIcon,
      trailingIcon,
      className = "",
      children,
      ...rest
    },
    ref,
  ) {
    return (
      <a
        ref={ref}
        className={buttonClassName({ variant, size, className })}
        aria-busy={pending || undefined}
        {...rest}
      >
        {pending ? (
          <>
            <Spinner className="h-4 w-4" />
            <span>{pendingLabel ?? children}</span>
          </>
        ) : (
          <>
            {leadingIcon ? <span aria-hidden>{leadingIcon}</span> : null}
            {children}
            {trailingIcon ? <span aria-hidden>{trailingIcon}</span> : null}
          </>
        )}
      </a>
    );
  },
);
