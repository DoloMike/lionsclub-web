import { describe, expect, it } from "vitest";
import { LCI_LOGO_DARK_SRC } from "@/lib/brand";
import { defaultDescription, defaultSocialLinks, site } from "@/lib/site";

describe("brand + site constants", () => {
  it("LCI_LOGO_DARK_SRC is a public path", () => {
    expect(LCI_LOGO_DARK_SRC).toBe("/brand/lci-logo-dark.svg");
  });

  it("site has expected chapter fields", () => {
    expect(site.shortName).toBe("Lewisport Lions");
    expect(site.address.zip).toBe("42351");
    expect(site.contact.phone).toBeNull();
  });

  it("defaultSocialLinks is non-empty", () => {
    expect(defaultSocialLinks.length).toBeGreaterThan(0);
  });

  it("defaultDescription is a string", () => {
    expect(defaultDescription.length).toBeGreaterThan(20);
  });
});
