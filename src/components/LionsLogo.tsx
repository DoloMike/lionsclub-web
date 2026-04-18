import Image from "next/image";
import { LCI_LOGO_DARK_SRC } from "@/lib/brand";

type LionsLogoProps = {
  className?: string;
  /** Shown to screen readers */
  alt?: string;
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
    <Image
      src={LCI_LOGO_DARK_SRC}
      alt={alt}
      width={200}
      height={48}
      className={className}
      priority={priority}
      unoptimized
    />
  );
}
