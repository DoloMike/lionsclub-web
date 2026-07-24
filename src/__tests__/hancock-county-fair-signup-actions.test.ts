import { beforeEach, describe, expect, it, vi } from "vitest";

const countQuery = vi.fn();
const insertSignup = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdmin: () => ({
    from: (table: string) => {
      if (table !== "hancock_county_fair_signups") {
        throw new Error(`Unexpected table in test mock: ${table}`);
      }

      return {
        select: (_cols: string, opts?: { count?: "exact"; head?: boolean }) => {
          if (opts?.count === "exact") {
            return { eq: () => countQuery() };
          }

          throw new Error("Unexpected select without count in test mock");
        },
        insert: insertSignup,
      };
    },
  }),
}));

const updateTag = vi.fn();
const redirect = vi.fn((to: string) => {
  throw new Error(`__REDIRECT__:${to}`);
});

vi.mock("next/cache", () => ({
  updateTag: (...args: unknown[]) => updateTag(...args),
}));

vi.mock("next/navigation", () => ({
  redirect: (to: string) => redirect(to),
}));

import { addHancockCountyFairSignup } from "@/app/hancock-county-fair-2026-signup/actions";

function buildFormData(entries: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    fd.append(key, value);
  }
  return fd;
}

describe("addHancockCountyFairSignup", () => {
  beforeEach(() => {
    countQuery.mockReset();
    insertSignup.mockReset();
    updateTag.mockReset();
    redirect.mockClear();
  });

  it("rejects an invalid signup key", async () => {
    await expect(
      addHancockCountyFairSignup(
        buildFormData({ signup_key: "not-a-real-key", name: "Dakota Basham" }),
      ),
    ).rejects.toThrow(/invalid hancock county fair signup row/i);
    expect(insertSignup).not.toHaveBeenCalled();
  });

  it("rejects when the signup row is full", async () => {
    countQuery.mockResolvedValueOnce({ count: 6, error: null });

    await expect(
      addHancockCountyFairSignup(
        buildFormData({ signup_key: "fair-gate-thursday", name: "Dakota Basham" }),
      ),
    ).rejects.toThrow(/all 6 spots for Thursday, August 6, 2026 are already filled/i);
    expect(insertSignup).not.toHaveBeenCalled();
  });

  it("inserts and redirects back to the filled row on success", async () => {
    countQuery.mockResolvedValueOnce({ count: 1, error: null });
    insertSignup.mockResolvedValueOnce({ error: null });

    await expect(
      addHancockCountyFairSignup(
        buildFormData({ signup_key: "lions-booth-friday", name: "Dakota Basham" }),
      ),
    ).rejects.toThrow(/__REDIRECT__:\/hancock-county-fair-2026-signup#lions-booth-friday/);

    expect(insertSignup).toHaveBeenCalledWith({
      signup_key: "lions-booth-friday",
      name: "Dakota Basham",
    });
    expect(updateTag).toHaveBeenCalledWith("hancock-county-fair-signups");
    expect(redirect).toHaveBeenCalledWith(
      "/hancock-county-fair-2026-signup#lions-booth-friday",
    );
  });
});
