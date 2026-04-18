import { beforeEach, describe, expect, it, vi } from "vitest";

const maybeSingle = vi.fn();
const listResult = vi.fn();

vi.mock("@/lib/supabase/public-server", () => ({
  createPublicServerClient: vi.fn(() => ({
    from: (table: string) => {
      if (table === "site_settings") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle,
            }),
          }),
        };
      }
      return {
        select: () => ({
          order: () => listResult(),
        }),
      };
    },
  })),
}));

import {
  getChapterEvents,
  getMeetingSchedule,
  getOfficers,
  getSocialLinks,
} from "@/lib/data/chapter-content";

describe("chapter-content", () => {
  beforeEach(() => {
    listResult.mockResolvedValue({ data: [], error: null });
  });

  it("getMeetingSchedule falls back on error", async () => {
    maybeSingle.mockResolvedValueOnce({ data: null, error: new Error("x") });
    const s = await getMeetingSchedule();
    expect(s).toContain("Contact");
  });

  it("getMeetingSchedule uses DB text when present", async () => {
    maybeSingle.mockResolvedValueOnce({
      data: { meeting_schedule: "  Tuesdays at 7  " },
      error: null,
    });
    const s = await getMeetingSchedule();
    expect(s).toContain("Tuesdays");
  });

  it("getOfficers returns empty on error", async () => {
    listResult.mockResolvedValueOnce({ data: null, error: new Error("x") });
    await expect(getOfficers()).resolves.toEqual([]);
  });

  it("getChapterEvents returns rows", async () => {
    listResult.mockResolvedValueOnce({
      data: [
        {
          id: "1",
          title: "Parade",
          event_date: "2026-07-04",
          description: null,
          sort_order: 0,
        },
      ],
      error: null,
    });
    const ev = await getChapterEvents();
    expect(ev).toHaveLength(1);
  });

  it("getSocialLinks uses defaults when DB empty", async () => {
    listResult.mockResolvedValueOnce({ data: [], error: null });
    const links = await getSocialLinks();
    expect(links.length).toBeGreaterThan(0);
    expect(links[0]?.id.startsWith("fallback-")).toBe(true);
  });
});
