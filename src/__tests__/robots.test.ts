import { describe, it, expect, afterEach, vi } from "vitest";
import robots from "@/app/robots";

describe("robots.txt", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("disallows all crawlers when not in production", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(robots()).toEqual({
      rules: { userAgent: "*", disallow: "/" },
    });
  });

  it("disallows all when NEXT_PUBLIC_NOINDEX is true in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_NOINDEX", "true");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://example.com");
    expect(robots()).toEqual({
      rules: { userAgent: "*", disallow: "/" },
    });
  });

  it("allows indexing and points sitemap when production and indexable", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_NOINDEX", "false");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://example.com/");
    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/" },
      sitemap: "https://example.com/sitemap.xml",
    });
  });
});
