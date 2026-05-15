"use client";

import { useCallback, useEffect, useState } from "react";
import { SitePhotoPublicImage } from "@/components/site-photos/SitePhotoPublicImage";
import type { SitePhoto } from "@/lib/site-photos";

const ROTATE_MS = 5500;
const TRANSITION_MS = 700;

/**
 * Auto-rotating photo banner used as a hero strip on top-level pages.
 *
 * Design choices:
 *  - Cross-fade transitions (not slide) so cropped portrait/landscape mix
 *    doesn't shift the layout horizontally.
 *  - Pauses when the user hovers or keyboard-focuses any control inside it.
 *  - Honors `prefers-reduced-motion`: no auto-advance, but dot controls still
 *    let users page through manually.
 *  - Plain `<img>` (not next/image) so we don't have to thread the Supabase
 *    storage hostname through `next.config.ts` `images.remotePatterns`.
 */
export function SitePhotoBanner({
  photos,
  ariaLabel,
}: {
  photos: SitePhoto[];
  ariaLabel: string;
}) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (photos.length <= 1 || paused) return;
    if (typeof window !== "undefined") {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (prefersReduced) return;
    }
    const id = window.setInterval(() => {
      setActive((idx) => (idx + 1) % photos.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [photos.length, paused]);

  const goTo = useCallback(
    (idx: number) => {
      if (photos.length === 0) return;
      setActive(((idx % photos.length) + photos.length) % photos.length);
    },
    [photos.length],
  );

  if (photos.length === 0) return null;

  const hasMultiple = photos.length > 1;

  return (
    <section
      aria-label={ariaLabel}
      aria-roledescription={hasMultiple ? "carousel" : undefined}
      className="relative isolate overflow-hidden bg-background border-b border-border"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/*
        Wider than Container (max-w-5xl): inner max-w-[90rem] for hero emphasis, with the same
        horizontal padding. Still capped so aspect-ratio scaling stays reasonable on
        ultra-wide monitors.
      */}
      <div className="mx-auto w-full max-w-[90rem] px-4 sm:px-6 lg:px-8">
        <div className="relative aspect-[16/7] w-full sm:aspect-[16/6]">
          {photos.map((photo, idx) => (
            <div
              key={photo.id}
              aria-hidden={idx !== active}
              className="absolute inset-0 z-0 transition-opacity ease-out"
              style={{
                opacity: idx === active ? 1 : 0,
                transitionDuration: `${TRANSITION_MS}ms`,
              }}
            >
              <SitePhotoPublicImage
                key={`${photo.id}-${photo.publicUrl}`}
                publicUrl={photo.publicUrl}
                alt={photo.altText}
                loading={idx === 0 ? "eager" : "lazy"}
                decoding={idx === 0 ? "sync" : "async"}
                className="h-full w-full object-cover"
              />
              {photo.caption ? (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-4 pb-10 pt-12 text-sm font-medium text-white sm:px-6 sm:pb-12 sm:text-base">
                  {photo.caption}
                </div>
              ) : null}
            </div>
          ))}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-[1] hidden w-[min(26%,4rem)] bg-gradient-to-r from-background via-background/55 to-transparent lg:block"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-[1] hidden w-[min(26%,4rem)] bg-gradient-to-l from-background via-background/55 to-transparent lg:block"
            aria-hidden
          />
          {hasMultiple ? (
            <div className="absolute inset-x-0 bottom-2 z-10 flex items-center justify-center gap-2 px-4 sm:bottom-3">
              {photos.map((photo, idx) => {
                const isActive = idx === active;
                return (
                  <button
                    key={photo.id}
                    type="button"
                    aria-label={`Show photo ${idx + 1} of ${photos.length}`}
                    aria-current={isActive ? "true" : undefined}
                    onClick={() => goTo(idx)}
                    className={`h-2 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/40 ${
                      isActive
                        ? "w-6 bg-white"
                        : "w-2 bg-white/60 hover:bg-white/80"
                    }`}
                  />
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
