import { describe, expect, it } from "vitest";
import {
  isAdminRole,
  isChapterMember,
  roleLabel,
} from "@/lib/auth/roles";

describe("roles", () => {
  it("isChapterMember", () => {
    expect(isChapterMember(undefined)).toBe(false);
    expect(isChapterMember("guest")).toBe(false);
    expect(isChapterMember("member")).toBe(true);
    expect(isChapterMember("admin")).toBe(true);
  });

  it("isAdminRole", () => {
    expect(isAdminRole(undefined)).toBe(false);
    expect(isAdminRole("member")).toBe(false);
    expect(isAdminRole("admin")).toBe(true);
  });

  it("roleLabel", () => {
    expect(roleLabel(undefined)).toBe("Guest");
    expect(roleLabel("admin")).toBe("Admin");
    expect(roleLabel("member")).toBe("Member");
    expect(roleLabel("guest")).toBe("Guest");
  });
});
