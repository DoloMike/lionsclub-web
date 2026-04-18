import { afterEach, describe, expect, it, vi } from "vitest";
import { leavesSiteForNewTab } from "@/lib/leaves-site";

describe("leavesSiteForNewTab", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns false for in-app paths and fragments", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://club.example.org");
    expect(leavesSiteForNewTab("/about")).toBe(false);
    expect(leavesSiteForNewTab("#main")).toBe(false);
    expect(leavesSiteForNewTab("?q=1")).toBe(false);
  });

  it("returns false for mailto and tel", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://club.example.org");
    expect(leavesSiteForNewTab("mailto:a@b.co")).toBe(false);
    expect(leavesSiteForNewTab("tel:+15551212")).toBe(false);
  });

  it("returns true for other origins when app URL is set", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://club.example.org");
    expect(leavesSiteForNewTab("https://www.lionsclubs.org/")).toBe(true);
    expect(leavesSiteForNewTab("//www.facebook.com/foo")).toBe(true);
  });

  it("returns false for same origin absolute URL", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://club.example.org");
    expect(leavesSiteForNewTab("https://club.example.org/other")).toBe(false);
  });

  it("returns true for https URLs when app URL is unset", () => {
    expect(leavesSiteForNewTab("https://example.com")).toBe(true);
  });
});
