import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Capture every `.update({...}).eq("id", id).eq("section", section)` chain so
// we can assert that section-scoping is applied and that ids land in the
// expected sort_order positions.
type UpdateCall = {
  payload: Record<string, unknown>;
  filters: Array<[string, string]>;
};

const updateCalls: UpdateCall[] = [];
const updateImpl = vi.fn();
const redirect = vi.fn((to: string) => {
  throw new Error(`__REDIRECT__:${to}`);
});
const updateTag = vi.fn();
const assertAdmin = vi.fn().mockResolvedValue({ userId: "admin-1" });

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdmin: () => ({
    from: (table: string) => {
      if (table !== "site_photos") {
        throw new Error(`Unexpected table in test mock: ${table}`);
      }
      return {
        update: (payload: Record<string, unknown>) => {
          const call: UpdateCall = { payload, filters: [] };
          updateCalls.push(call);
          const chain: { eq: (key: string, value: string) => unknown } = {
            eq: (key: string, value: string) => {
              call.filters.push([key, value]);
              // Resolve the awaitable on the second .eq() (matches the
              // production call shape: .eq("id", id).eq("section", section)).
              if (call.filters.length >= 2) {
                return Promise.resolve(updateImpl(call));
              }
              return chain;
            },
          };
          return chain;
        },
      };
    },
  }),
}));

vi.mock("@/lib/auth/assert-admin", () => ({
  assertAdmin: () => assertAdmin(),
}));

vi.mock("next/cache", () => ({
  updateTag: (...args: unknown[]) => updateTag(...args),
}));

vi.mock("next/navigation", () => ({
  redirect: (to: string) => redirect(to),
}));

// Import AFTER mocks are registered.
import { reorderSitePhotos } from "@/app/admin/(protected)/actions";

function buildFormData(section: string, ids: string[]): FormData {
  const fd = new FormData();
  fd.append("section", section);
  for (const id of ids) fd.append("id", id);
  return fd;
}

beforeEach(() => {
  updateCalls.length = 0;
  updateImpl.mockReset();
  updateImpl.mockResolvedValue({ error: null });
  redirect.mockClear();
  updateTag.mockReset();
});

afterEach(() => vi.resetAllMocks());

describe("reorderSitePhotos", () => {
  it("rejects unknown section keys", async () => {
    await expect(
      reorderSitePhotos(buildFormData("not-a-section", ["a", "b"])),
    ).rejects.toThrow(/Unknown photo section/i);
    expect(updateCalls).toHaveLength(0);
    expect(updateTag).not.toHaveBeenCalled();
  });

  it("rejects when no ids are provided", async () => {
    await expect(
      reorderSitePhotos(buildFormData("fundraising-banner", [])),
    ).rejects.toThrow(/No photos to reorder/i);
    expect(updateCalls).toHaveLength(0);
  });

  it("issues one section-scoped UPDATE per id, sort_order = index", async () => {
    await expect(
      reorderSitePhotos(
        buildFormData("fundraising-banner", ["a", "b", "c"]),
      ),
    ).rejects.toThrow(/__REDIRECT__/);

    expect(updateCalls).toHaveLength(3);

    for (let i = 0; i < updateCalls.length; i++) {
      const call = updateCalls[i]!;
      expect(call.payload).toMatchObject({ sort_order: i });
      // Section scoping is the key defense-in-depth here: a forged id from
      // another section must NOT have its sort_order rewritten because the
      // section filter won't match the row.
      expect(call.filters).toEqual([
        ["id", ["a", "b", "c"][i]],
        ["section", "fundraising-banner"],
      ]);
    }

    expect(updateTag).toHaveBeenCalledWith("site-photos:fundraising-banner");
    expect(redirect).toHaveBeenCalledWith("/admin/photos?saved=1");
  });

  it("filters out blank ids", async () => {
    await expect(
      reorderSitePhotos(
        buildFormData("fundraising-banner", ["a", "", "b"]),
      ),
    ).rejects.toThrow(/__REDIRECT__/);

    expect(updateCalls).toHaveLength(2);
    expect(updateCalls[0]!.filters[0]).toEqual(["id", "a"]);
    expect(updateCalls[1]!.filters[0]).toEqual(["id", "b"]);
  });
});
