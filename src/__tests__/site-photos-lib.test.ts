import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

describe("site-photos lib", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = ORIGINAL_SUPABASE_URL;
  });

  describe("buildSitePhotoPublicUrl", () => {
    it("joins the Supabase URL with the public bucket path", async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
      const { buildSitePhotoPublicUrl } = await import("@/lib/site-photos");
      expect(
        buildSitePhotoPublicUrl(
          "fundraising-banner/abc-123.webp",
        ),
      ).toBe(
        "https://example.supabase.co/storage/v1/object/public/site-photos/fundraising-banner/abc-123.webp",
      );
    });

    it("strips trailing slashes from the Supabase URL", async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co/";
      const { buildSitePhotoPublicUrl } = await import("@/lib/site-photos");
      expect(buildSitePhotoPublicUrl("a/b.webp")).toBe(
        "https://example.supabase.co/storage/v1/object/public/site-photos/a/b.webp",
      );
    });

    it("URL-encodes each path segment separately so slashes survive", async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
      const { buildSitePhotoPublicUrl } = await import("@/lib/site-photos");
      // The space and ampersand must be encoded, but the segment separator
      // (/) must NOT be — otherwise the URL points to one big filename
      // instead of a nested path.
      const url = buildSitePhotoPublicUrl("section name/file & co.webp");
      expect(url).toBe(
        "https://example.supabase.co/storage/v1/object/public/site-photos/section%20name/file%20%26%20co.webp",
      );
    });
  });

  describe("withImageCacheBust", () => {
    it("appends __cb without clobbering path", async () => {
      const { withImageCacheBust } = await import("@/lib/site-photos");
      const base =
        "https://example.supabase.co/storage/v1/object/public/site-photos/fundraising-banner/x.webp";
      const out = withImageCacheBust(base, "173");
      expect(out).toBe(`${base}?__cb=173`);
    });

    it("merges with existing query string", async () => {
      const { withImageCacheBust } = await import("@/lib/site-photos");
      const base =
        "https://example.supabase.co/storage/v1/object/public/site-photos/a/b.webp?foo=1";
      const out = withImageCacheBust(base, "x");
      expect(out).toContain("__cb=x");
      expect(out).toContain("foo=1");
    });
  });

  describe("extensionForMimeType", () => {
    it("maps the four supported types", async () => {
      const { extensionForMimeType } = await import("@/lib/site-photos");
      expect(extensionForMimeType("image/jpeg")).toBe("jpg");
      expect(extensionForMimeType("image/png")).toBe("png");
      expect(extensionForMimeType("image/webp")).toBe("webp");
      expect(extensionForMimeType("image/avif")).toBe("avif");
    });

    it("returns null for unknown types", async () => {
      const { extensionForMimeType } = await import("@/lib/site-photos");
      expect(extensionForMimeType("image/gif")).toBeNull();
      expect(extensionForMimeType("application/pdf")).toBeNull();
      expect(extensionForMimeType("")).toBeNull();
    });
  });

  describe("SITE_PHOTO_ALLOWED_MIME_TYPES + SITE_PHOTO_MAX_BYTES", () => {
    it("stays in sync with the bucket constraints in the migration", async () => {
      const {
        SITE_PHOTO_ALLOWED_MIME_TYPES,
        SITE_PHOTO_MAX_BYTES,
        SITE_PHOTO_BUCKET,
      } = await import("@/lib/site-photos");
      expect(SITE_PHOTO_BUCKET).toBe("site-photos");
      expect([...SITE_PHOTO_ALLOWED_MIME_TYPES].sort()).toEqual(
        ["image/avif", "image/jpeg", "image/png", "image/webp"].sort(),
      );
      // The migration enforces 10 MiB; the JS-side validator must match so we
      // don't waste a sharp() round-trip on a file the bucket will reject.
      expect(SITE_PHOTO_MAX_BYTES).toBe(10 * 1024 * 1024);
    });
  });
});

describe("photo-sections registry", () => {
  it("includes the fundraising-banner section", async () => {
    const { SITE_PHOTO_SECTIONS, isSitePhotoSectionKey } = await import(
      "@/lib/photo-sections"
    );
    expect(SITE_PHOTO_SECTIONS.map((s) => s.key)).toContain(
      "fundraising-banner",
    );
    expect(isSitePhotoSectionKey("fundraising-banner")).toBe(true);
  });

  it("rejects unknown section keys", async () => {
    const { isSitePhotoSectionKey } = await import("@/lib/photo-sections");
    expect(isSitePhotoSectionKey("not-a-section")).toBe(false);
    expect(isSitePhotoSectionKey("")).toBe(false);
  });
});
