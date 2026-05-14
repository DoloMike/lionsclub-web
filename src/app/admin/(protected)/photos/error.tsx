"use client";

import { useEffect } from "react";
import { Container } from "@/components/Container";
import { Button, ButtonLink } from "@/components/ui/Button";
import { sitePhotoUploadErrorGuidance } from "@/lib/site-photo-upload-errors";

export default function AdminPhotosError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AdminPhotosError]", error);
  }, [error]);

  const guidance = sitePhotoUploadErrorGuidance(error.message);
  const title = guidance?.title ?? "Something went wrong on Photos";
  const description =
    guidance?.body ??
    (error.message?.trim()
      ? error.message
      : "An unexpected error occurred. You can try again or go back to the Photos admin list.");

  return (
    <div className="border-b border-border bg-muted/20 py-12">
      <Container>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        <p className="mt-3 max-w-2xl whitespace-pre-line text-sm text-muted-foreground">
          {description}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button onClick={() => reset()}>Try again</Button>
          <ButtonLink href="/admin/photos" variant="secondary">
            Photos admin
          </ButtonLink>
        </div>
        {!guidance && error.digest ? (
          <p className="mt-6 font-mono text-xs text-muted-foreground">
            Reference: {error.digest}
          </p>
        ) : null}
      </Container>
    </div>
  );
}
