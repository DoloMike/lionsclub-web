import { describe, expect, it, vi } from "vitest";

const fromMock = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdmin: () => ({
    from: fromMock,
  }),
}));

import { getPaidChickenOrderEventIdsForUser } from "@/lib/data/chicken-orders";

describe("getPaidChickenOrderEventIdsForUser", () => {
  it("returns empty set with no identifiers", async () => {
    const s = await getPaidChickenOrderEventIdsForUser(undefined, undefined);
    expect([...s]).toEqual([]);
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("loads by user_id and email", async () => {
    fromMock.mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          eq: () =>
            Promise.resolve({
              data: [{ event_id: "e1" }, { event_id: "e2" }],
            }),
        }),
      }),
    }));

    const byUser = await getPaidChickenOrderEventIdsForUser("u1", undefined);
    expect(byUser.has("e1")).toBe(true);

    const byEmail = await getPaidChickenOrderEventIdsForUser(
      undefined,
      "  Test@Example.COM "
    );
    expect(byEmail.size).toBeGreaterThanOrEqual(0);
  });
});
