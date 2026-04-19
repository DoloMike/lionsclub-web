"use client";

import { useEffect } from "react";
import { Container } from "@/components/Container";
import { Button, ButtonLink } from "@/components/ui/Button";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[RootError]", error);
  }, [error]);

  return (
    <div className="border-b border-border bg-muted/20 py-16">
      <Container>
        <h1 className="text-xl font-semibold text-foreground">
          Something went wrong
        </h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          An unexpected error occurred. You can try again, or return to the home
          page.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button onClick={() => reset()}>Try again</Button>
          <ButtonLink href="/" variant="secondary">
            Home
          </ButtonLink>
        </div>
        {error.digest ? (
          <p className="mt-6 font-mono text-xs text-muted-foreground">
            Reference: {error.digest}
          </p>
        ) : null}
      </Container>
    </div>
  );
}
