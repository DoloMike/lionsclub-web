import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "@supabase/supabase-js";

// Mock plumbing -------------------------------------------------------------
// Each table the actions touch gets its own mock so we can assert on inputs
// and stage per-test responses.

const shiftSingle = vi.fn();
const eventSingle = vi.fn();
const countQuery = vi.fn();
const insertSignup = vi.fn();
const signupLookupSingle = vi.fn();
const deleteSignup = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdmin: () => ({
    from: (table: string) => {
      if (table === "volunteer_shifts") {
        return {
          select: () => ({
            eq: () => ({ maybeSingle: shiftSingle }),
          }),
        };
      }
      if (table === "volunteer_events") {
        return {
          select: () => ({
            eq: () => ({ maybeSingle: eventSingle }),
          }),
        };
      }
      if (table === "volunteer_signups") {
        return {
          select: (
            _cols: string,
            opts?: { count?: "exact"; head?: boolean },
          ) => {
            // `.select("id, ...", { count: "exact", head: true })` → capacity
            // check; otherwise it's the row-by-id lookup used by the remove
            // flow.
            if (opts && opts.count === "exact") {
              return { eq: () => countQuery() };
            }
            return {
              eq: () => ({ maybeSingle: signupLookupSingle }),
            };
          },
          insert: insertSignup,
          delete: () => ({ eq: deleteSignup }),
        };
      }
      throw new Error(`Unexpected table in test mock: ${table}`);
    },
  }),
}));

const getSessionUser = vi.fn();
vi.mock("@/lib/auth/get-session", () => ({
  getSessionUser: () => getSessionUser(),
}));

const updateTag = vi.fn();
const redirect = vi.fn((to: string) => {
  // Server-action `redirect()` throws internally so callers' code after it
  // doesn't run. Mirror that so we can both detect "did it redirect?" and
  // know the action did not fall through to unrelated code.
  throw new Error(`__REDIRECT__:${to}`);
});

vi.mock("next/cache", () => ({
  updateTag: (...args: unknown[]) => updateTag(...args),
}));

vi.mock("next/navigation", () => ({
  redirect: (to: string) => redirect(to),
}));

// Import AFTER mocks are registered.
import {
  addVolunteerSignup,
  removeMyVolunteerSignup,
} from "@/app/volunteer/[slug]/actions";

function buildFormData(entries: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    fd.append(key, value);
  }
  return fd;
}

function buildUser(overrides: Partial<User> = {}): User {
  return {
    id: "user-1",
    aud: "authenticated",
    role: "authenticated",
    app_metadata: {},
    user_metadata: { full_name: "Jane Volunteer" },
    email: "jane@example.com",
    created_at: "2026-01-01T00:00:00Z",
    ...overrides,
  } as User;
}

const SHIFT_ID = "shift-1";
const EVENT_ID = "event-1";
const SLUG = "test-event";

function happyShift(maxSignups: number | null = null) {
  shiftSingle.mockResolvedValueOnce({
    data: { id: SHIFT_ID, event_id: EVENT_ID, max_signups: maxSignups },
    error: null,
  });
}

function happyEvent(
  overrides: { published?: boolean; signups_open?: boolean; slug?: string } = {},
) {
  eventSingle.mockResolvedValueOnce({
    data: {
      id: EVENT_ID,
      slug: overrides.slug ?? SLUG,
      published: overrides.published ?? true,
      signups_open: overrides.signups_open ?? true,
    },
    error: null,
  });
}

beforeEach(() => {
  shiftSingle.mockReset();
  eventSingle.mockReset();
  countQuery.mockReset();
  insertSignup.mockReset();
  signupLookupSingle.mockReset();
  deleteSignup.mockReset();
  getSessionUser.mockReset();
  updateTag.mockReset();
  redirect.mockClear();
});

afterEach(() => vi.resetAllMocks());

describe("addVolunteerSignup", () => {
  const baseFd = () =>
    buildFormData({ shift_id: SHIFT_ID, slug: SLUG });

  it("rejects when shift_id is missing", async () => {
    await expect(
      addVolunteerSignup(buildFormData({ slug: SLUG })),
    ).rejects.toThrow(/Missing shift id/i);
    expect(insertSignup).not.toHaveBeenCalled();
  });

  it("rejects when slug is missing", async () => {
    await expect(
      addVolunteerSignup(buildFormData({ shift_id: SHIFT_ID })),
    ).rejects.toThrow(/Missing event slug/i);
    expect(insertSignup).not.toHaveBeenCalled();
  });

  it("requires a signed-in user", async () => {
    getSessionUser.mockResolvedValueOnce(null);
    await expect(addVolunteerSignup(baseFd())).rejects.toThrow(
      /Please sign in/i,
    );
    expect(insertSignup).not.toHaveBeenCalled();
  });

  it("throws when the shift does not exist", async () => {
    getSessionUser.mockResolvedValueOnce(buildUser());
    shiftSingle.mockResolvedValueOnce({ data: null, error: null });
    await expect(addVolunteerSignup(baseFd())).rejects.toThrow(
      /Shift not found/i,
    );
    expect(insertSignup).not.toHaveBeenCalled();
  });

  it("throws when the shift's event does not exist", async () => {
    getSessionUser.mockResolvedValueOnce(buildUser());
    happyShift();
    eventSingle.mockResolvedValueOnce({ data: null, error: null });
    await expect(addVolunteerSignup(baseFd())).rejects.toThrow(
      /Event not found/i,
    );
    expect(insertSignup).not.toHaveBeenCalled();
  });

  it("rejects when the form's slug doesn't match the shift's event", async () => {
    getSessionUser.mockResolvedValueOnce(buildUser());
    happyShift();
    happyEvent({ slug: "different-event" });
    await expect(addVolunteerSignup(baseFd())).rejects.toThrow(
      /Shift does not belong to this event/i,
    );
    expect(insertSignup).not.toHaveBeenCalled();
  });

  it("rejects when the event is not published", async () => {
    getSessionUser.mockResolvedValueOnce(buildUser());
    happyShift();
    happyEvent({ published: false });
    await expect(addVolunteerSignup(baseFd())).rejects.toThrow(
      /Signups are not currently open/i,
    );
    expect(insertSignup).not.toHaveBeenCalled();
  });

  it("rejects when signups are closed", async () => {
    getSessionUser.mockResolvedValueOnce(buildUser());
    happyShift();
    happyEvent({ signups_open: false });
    await expect(addVolunteerSignup(baseFd())).rejects.toThrow(
      /Signups are not currently open/i,
    );
    expect(insertSignup).not.toHaveBeenCalled();
  });

  it("rejects when the shift is at capacity", async () => {
    getSessionUser.mockResolvedValueOnce(buildUser());
    happyShift(3);
    happyEvent();
    countQuery.mockResolvedValueOnce({ count: 3, error: null });
    await expect(addVolunteerSignup(baseFd())).rejects.toThrow(
      /shift is full/i,
    );
    expect(insertSignup).not.toHaveBeenCalled();
  });

  it("inserts with the session user's id and derived display name on success", async () => {
    getSessionUser.mockResolvedValueOnce(buildUser());
    happyShift();
    happyEvent();
    insertSignup.mockResolvedValueOnce({ error: null });

    await expect(addVolunteerSignup(baseFd())).rejects.toThrow(
      /__REDIRECT__:\/volunteer\/test-event#shift-shift-1/,
    );
    expect(insertSignup).toHaveBeenCalledWith({
      shift_id: SHIFT_ID,
      user_id: "user-1",
      name: "Jane Volunteer",
    });
    expect(updateTag).toHaveBeenCalledWith(`volunteer-event:${SLUG}`);
    expect(redirect).toHaveBeenCalledWith(`/volunteer/${SLUG}#shift-${SHIFT_ID}`);
  });

  it("treats a 23505 unique-violation as success (idempotent re-click)", async () => {
    getSessionUser.mockResolvedValueOnce(buildUser());
    happyShift();
    happyEvent();
    insertSignup.mockResolvedValueOnce({
      error: { code: "23505", message: "unique_violation" },
    });

    await expect(addVolunteerSignup(baseFd())).rejects.toThrow(/__REDIRECT__/);
    expect(updateTag).toHaveBeenCalledWith(`volunteer-event:${SLUG}`);
    expect(redirect).toHaveBeenCalled();
  });

  it("surfaces other insert errors", async () => {
    getSessionUser.mockResolvedValueOnce(buildUser());
    happyShift();
    happyEvent();
    insertSignup.mockResolvedValueOnce({
      error: { code: "42P01", message: "no table" },
    });

    await expect(addVolunteerSignup(baseFd())).rejects.toMatchObject({
      message: expect.stringMatching(/no table/i),
    });
    expect(updateTag).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });
});

describe("removeMyVolunteerSignup", () => {
  const baseFd = () =>
    buildFormData({ signup_id: "signup-1", slug: SLUG });

  it("requires a signed-in user", async () => {
    getSessionUser.mockResolvedValueOnce(null);
    await expect(removeMyVolunteerSignup(baseFd())).rejects.toThrow(
      /Please sign in/i,
    );
    expect(deleteSignup).not.toHaveBeenCalled();
  });

  it("redirects gracefully when the signup is already gone", async () => {
    getSessionUser.mockResolvedValueOnce(buildUser());
    signupLookupSingle.mockResolvedValueOnce({ data: null, error: null });

    await expect(removeMyVolunteerSignup(baseFd())).rejects.toThrow(
      /__REDIRECT__:\/volunteer\/test-event/,
    );
    expect(deleteSignup).not.toHaveBeenCalled();
  });

  it("refuses to delete another user's signup", async () => {
    getSessionUser.mockResolvedValueOnce(buildUser({ id: "user-1" }));
    signupLookupSingle.mockResolvedValueOnce({
      data: { id: "signup-1", shift_id: SHIFT_ID, user_id: "someone-else" },
      error: null,
    });

    await expect(removeMyVolunteerSignup(baseFd())).rejects.toThrow(
      /only remove your own/i,
    );
    expect(deleteSignup).not.toHaveBeenCalled();
  });

  it("deletes when the user owns the signup", async () => {
    getSessionUser.mockResolvedValueOnce(buildUser({ id: "user-1" }));
    signupLookupSingle.mockResolvedValueOnce({
      data: { id: "signup-1", shift_id: SHIFT_ID, user_id: "user-1" },
      error: null,
    });
    deleteSignup.mockResolvedValueOnce({ error: null });

    await expect(removeMyVolunteerSignup(baseFd())).rejects.toThrow(
      /__REDIRECT__:\/volunteer\/test-event#shift-shift-1/,
    );
    expect(deleteSignup).toHaveBeenCalled();
    expect(updateTag).toHaveBeenCalledWith(`volunteer-event:${SLUG}`);
  });
});
