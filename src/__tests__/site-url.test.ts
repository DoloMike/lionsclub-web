import { afterEach, describe, expect, it, vi } from "vitest";
import { getPublicSiteUrl } from "@/lib/site-url";

describe("getPublicSiteUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("strips trailing slash from NEXT_PUBLIC_APP_URL", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://example.com/");
    expect(getPublicSiteUrl()).toBe("https://example.com");
  });

  it("defaults when NEXT_PUBLIC_APP_URL is missing", () => {
    const prev = process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.NEXT_PUBLIC_APP_URL;
    expect(getPublicSiteUrl()).toBe("http://localhost:3000");
    process.env.NEXT_PUBLIC_APP_URL = prev;
  });
});
