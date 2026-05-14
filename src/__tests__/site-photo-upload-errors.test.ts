import { describe, expect, it } from "vitest";
import { sitePhotoUploadErrorGuidance } from "@/lib/site-photo-upload-errors";

describe("sitePhotoUploadErrorGuidance", () => {
  it("matches unexpected end of form", () => {
    const g = sitePhotoUploadErrorGuidance("Error: Unexpected end of form");
    expect(g).not.toBeNull();
    expect(g!.title).toContain("batch");
    expect(g!.body).toContain("10");
    expect(g!.body).toContain("60");
  });

  it("matches body exceeded message", () => {
    expect(
      sitePhotoUploadErrorGuidance("Body exceeded 1 MB limit."),
    ).not.toBeNull();
  });

  it("returns null for unrelated errors", () => {
    expect(sitePhotoUploadErrorGuidance("Out of memory")).toBeNull();
  });
});
