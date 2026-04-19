type SpinnerProps = {
  className?: string;
  /** Optional accessible label; when omitted the spinner is decorative. */
  label?: string;
};

/**
 * Inline progress spinner. Inherits color from `currentColor` so it adapts to
 * any button variant. ~0.2KB and uses Tailwind's `animate-spin` (CSS-only).
 */
export function Spinner({ className = "", label }: SpinnerProps) {
  return (
    <svg
      className={`animate-spin ${className}`.trim()}
      viewBox="0 0 16 16"
      fill="none"
      role={label ? "status" : undefined}
      aria-hidden={label ? undefined : true}
      aria-label={label}
    >
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="2"
      />
      <path
        d="M14 8a6 6 0 0 0-6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
