import type { ReactNode } from "react";
import { Container } from "@/components/Container";

/** Simple text column (no @tailwindcss/typography dependency). */
export function Prose({ children }: { children: ReactNode }) {
  return (
    <Container className="py-12 sm:py-16">
      <div
        className={[
          "max-w-prose space-y-4 leading-relaxed text-muted-foreground",
          // Inline links (anywhere in body copy) — premium underline-on-hover.
          "[&_blockquote_a]:font-medium [&_blockquote_a]:text-primary [&_blockquote_a]:underline-offset-4 [&_blockquote_a]:transition-colors [&_blockquote_a]:hover:underline",
          "[&_li_a]:font-medium [&_li_a]:text-primary [&_li_a]:underline-offset-4 [&_li_a]:transition-colors [&_li_a]:hover:underline",
          "[&_p_a]:font-medium [&_p_a]:text-primary [&_p_a]:underline-offset-4 [&_p_a]:transition-colors [&_p_a]:hover:underline",
          // H2 / H3 — bumped up so internal pages match the Landing typographic
          // scale (was text-xl which made the same heading rank look "smaller"
          // on Prose pages than on the home page).
          "[&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground [&_h2]:first:mt-0 sm:[&_h2]:text-2xl",
          "[&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground sm:[&_h3]:text-lg",
          "[&_li]:mt-1 [&_ul]:list-disc [&_ul]:pl-5",
        ].join(" ")}
      >
        {children}
      </div>
    </Container>
  );
}
