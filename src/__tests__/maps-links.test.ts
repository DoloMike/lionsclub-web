import { describe, expect, it } from "vitest";
import { googleMapsSearchUrl } from "@/lib/maps-links";

describe("googleMapsSearchUrl", () => {
  it("returns empty for blank query", () => {
    expect(googleMapsSearchUrl("")).toBe("");
    expect(googleMapsSearchUrl("   ")).toBe("");
  });

  it("encodes query in maps search URL", () => {
    expect(googleMapsSearchUrl("Lewisport KY")).toContain(
      encodeURIComponent("Lewisport KY")
    );
    expect(googleMapsSearchUrl("Lewisport KY")).toMatch(
      /^https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=/
    );
  });
});
