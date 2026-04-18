import type { ReactNode } from "react";
import { Container } from "@/components/Container";

/** Simple text column (no @tailwindcss/typography dependency). */
export function Prose({ children }: { children: ReactNode }) {
  return (
    <Container className="py-12 sm:py-16">
      <div className="max-w-prose space-y-4 leading-relaxed text-muted-foreground [&_a]:font-medium [&_a]:text-primary [&_a]:underline-offset-4 [&_a]:hover:underline [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:first:mt-0 [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_li]:mt-1 [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </div>
    </Container>
  );
}
