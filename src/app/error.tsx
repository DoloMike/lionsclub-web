"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Container } from "@/components/Container";

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
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-card-foreground transition hover:bg-muted"
          >
            Home
          </Link>
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
