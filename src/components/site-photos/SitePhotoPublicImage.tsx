"use client";

import { useState, type ImgHTMLAttributes } from "react";
import { withImageCacheBust } from "@/lib/site-photos";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "onError"> & {
  publicUrl: string;
};

/**
 * `<img>` for Supabase public object URLs. Retries once with a cache-busting
 * query param if the first load fails — works around poisoned HTTP cache
 * entries (same URL works in incognito).
 *
 * Remount with a new `key` when `publicUrl` changes (parent should use e.g.
 * `key={\`${photo.id}-${photo.publicUrl}\`}`).
 */
export function SitePhotoPublicImage({
  publicUrl,
  alt,
  ...rest
}: Props) {
  const [src, setSrc] = useState(publicUrl);

  return (
    // eslint-disable-next-line @next/next/no-img-element -- plain URL from Supabase public bucket
    <img
      {...rest}
      src={src}
      alt={alt}
      onError={() => {
        setSrc((prev) =>
          prev === publicUrl
            ? withImageCacheBust(publicUrl, String(Date.now()))
            : prev,
        );
      }}
    />
  );
}
