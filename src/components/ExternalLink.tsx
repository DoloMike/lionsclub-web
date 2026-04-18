import type { ComponentProps } from "react";
import { leavesSiteForNewTab } from "@/lib/leaves-site";

type ExternalLinkProps = ComponentProps<"a">;

/**
 * Renders `<a>` and adds `target="_blank"` + `rel="noopener noreferrer"` when
 * the href leaves this site (see `leavesSiteForNewTab`).
 */
export function ExternalLink({
  href,
  target,
  rel,
  ...rest
}: ExternalLinkProps) {
  const hrefStr = typeof href === "string" ? href : "";
  const leave = leavesSiteForNewTab(hrefStr);

  return (
    <a
      href={href}
      {...rest}
      rel={leave ? "noopener noreferrer" : rel}
      target={leave ? "_blank" : target}
    />
  );
}
