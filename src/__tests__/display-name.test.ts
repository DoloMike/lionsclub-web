import { describe, expect, it } from "vitest";
import type { User } from "@supabase/supabase-js";
import { deriveDisplayName } from "@/lib/auth/display-name";

function buildUser(overrides: Partial<User> = {}): User {
  return {
    id: "user-1",
    aud: "authenticated",
    role: "authenticated",
    app_metadata: {},
    user_metadata: {},
    created_at: "2026-01-01T00:00:00Z",
    ...overrides,
  } as User;
}

describe("deriveDisplayName", () => {
  it("prefers user_metadata.full_name when present", () => {
    expect(
      deriveDisplayName(
        buildUser({
          user_metadata: { full_name: "Jane Doe", name: "ignored" },
          email: "jane@example.com",
        }),
      ),
    ).toBe("Jane Doe");
  });

  it("falls back to user_metadata.name when full_name is missing or blank", () => {
    expect(
      deriveDisplayName(
        buildUser({
          user_metadata: { full_name: "   ", name: "Jane D" },
          email: "jane@example.com",
        }),
      ),
    ).toBe("Jane D");
  });

  it("falls back to email local-part when no metadata name is set", () => {
    expect(
      deriveDisplayName(
        buildUser({ user_metadata: {}, email: "jane.doe@example.com" }),
      ),
    ).toBe("jane.doe");
  });

  it("uses the full email when the local-part would be empty", () => {
    expect(
      deriveDisplayName(buildUser({ user_metadata: {}, email: "@weird" })),
    ).toBe("@weird");
  });

  it("falls back to 'Lions volunteer' when nothing usable is available", () => {
    expect(
      deriveDisplayName(buildUser({ user_metadata: {}, email: undefined })),
    ).toBe("Lions volunteer");
  });

  it("trims whitespace from the chosen value", () => {
    expect(
      deriveDisplayName(
        buildUser({
          user_metadata: { full_name: "  Jane Doe  " },
        }),
      ),
    ).toBe("Jane Doe");
  });
});
