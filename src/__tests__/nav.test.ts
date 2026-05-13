import { describe, expect, it } from "vitest";
import {
  isNavHrefActive,
  mainNav,
  mobileNavLinkClassName,
  navLinkClassName,
} from "@/lib/nav";

describe("nav", () => {
  it("mainNav lists primary routes", () => {
    const hrefs = mainNav.map((i) => i.href);

    expect(hrefs).toContain("/fundraising");
    expect(hrefs).not.toContain("/heritage-festival-2026-signup");
  });

  describe("isNavHrefActive", () => {
    it("matches exact path", () => {
      expect(isNavHrefActive("/about", "/about")).toBe(true);
    });

    it("matches nested routes", () => {
      expect(isNavHrefActive("/fundraising/order", "/fundraising")).toBe(true);
    });

    it("does not match root for non-root href", () => {
      expect(isNavHrefActive("/", "/fundraising")).toBe(false);
    });
  });

  it("navLinkClassName toggles active styles", () => {
    expect(navLinkClassName(true)).toContain("text-primary");
    expect(navLinkClassName(false)).toContain("text-muted-foreground");
  });

  it("mobileNavLinkClassName toggles active styles", () => {
    expect(mobileNavLinkClassName(true)).toContain("text-primary");
    expect(mobileNavLinkClassName(false)).toContain("text-foreground");
  });
});
