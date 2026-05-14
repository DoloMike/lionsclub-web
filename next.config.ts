import type { NextConfig } from "next";

function securityHeaders(): { key: string; value: string }[] {
  const headers: { key: string; value: string }[] = [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "SAMEORIGIN" },
    {
      key: "Referrer-Policy",
      value: "strict-origin-when-cross-origin",
    },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=()",
    },
  ];

  if (process.env.NODE_ENV === "production") {
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=31536000; includeSubDomains",
    });
  }

  if (process.env.NEXT_PUBLIC_NOINDEX === "true") {
    headers.push({ key: "X-Robots-Tag", value: "noindex, nofollow" });
  }

  return headers;
}

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  /**
   * Default Server Action body limit is 1 MB. Site photo uploads allow 10 MiB
   * per file and `multiple` on one form — the limit must cover the whole
   * multipart body (e.g. several files + boundaries), or busboy ends with
   * "Unexpected end of form".
   *
   * With `src/proxy.ts` enabled, Next also enforces **proxyClientMaxBodySize**
   * (default **10 MB**) on incoming request bodies. That cuts off multi-file
   * uploads before `serverActions.bodySizeLimit` is applied — raise both.
   *
   * In Next 16.2.x `serverActions` must live under `experimental`.
   */
  experimental: {
    serverActions: {
      // ~6× max per-file size (see SITE_PHOTO_MAX_BYTES) + multipart overhead
      bodySizeLimit: "64mb",
    },
    proxyClientMaxBodySize: "64mb",
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders(),
      },
    ];
  },
};

export default nextConfig;
