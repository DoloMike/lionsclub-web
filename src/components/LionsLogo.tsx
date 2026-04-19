import { LCI_LOGO_DARK_SRC } from "@/lib/brand";

type LionsLogoProps = {
  className?: string;
  /** Shown to screen readers */
  alt?: string;
  /** Hint for LCP; passed through as `fetchPriority` on the img. */
  priority?: boolean;
};

/**
 * Official LCI `logo-dark.svg` (for light backgrounds), from `/public/brand`.
 */
export function LionsLogo({
  className = "h-9 w-auto max-w-[160px] sm:max-w-[200px]",
  alt = "Lions Clubs International",
  priority = false,
}: LionsLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- SVG logo; next/image adds little here
    <img
      src={LCI_LOGO_DARK_SRC}
      alt={alt}
      width={200}
      height={48}
      className={className}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
    />
  );
}
