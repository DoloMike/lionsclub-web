import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type Row = {
  id: string;
  title: string;
  event_date: string;
  orders_close_date: string;
  orders_close_at: string | null;
  pickup_starts_at: string | null;
  pickup_location: string | null;
  order_open: boolean;
};

const mockState = vi.hoisted(() => ({
  rows: [] as Row[],
  error: null as { message: string } | null,
  noClient: false,
}));

vi.mock("@/lib/supabase/public-server", () => ({
  createPublicServerClient: () => {
    if (mockState.noClient) return null;
    return {
      from: () => ({
        select: () => ({
          eq: () => ({
            gt: () =>
              Promise.resolve({
                data: mockState.rows,
                error: mockState.error,
              }),
          }),
        }),
      }),
    };
  },
}));

const paidMock = vi.fn().mockResolvedValue(new Set());

vi.mock("@/lib/data/chicken-orders", () => ({
  getPaidChickenOrderEventIdsForUser: (...args: unknown[]) => paidMock(...args),
}));

import { getFundraiserBannerSegments } from "@/lib/data/fundraiser-banner";

function baseRow(overrides: Partial<Row> = {}): Row {
  return {
    id: "id1",
    title: "Cook",
    event_date: "2026-06-15",
    orders_close_date: "2026-06-01",
    orders_close_at: null,
    pickup_starts_at: null,
    pickup_location: null,
    order_open: true,
    ...overrides,
  };
}

describe("getFundraiserBannerSegments — exhaustive formatting", () => {
  beforeEach(() => {
    mockState.rows = [];
    mockState.error = null;
    mockState.noClient = false;
    paidMock.mockResolvedValue(new Set());
    vi.useFakeTimers({ now: new Date("2026-04-01T12:00:00.000Z") });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns [] when public client is null", async () => {
    mockState.noClient = true;
    await expect(getFundraiserBannerSegments(null)).resolves.toEqual([]);
  });

  it("returns [] on Supabase error", async () => {
    mockState.error = { message: "x" };
    await expect(getFundraiserBannerSegments(null)).resolves.toEqual([]);
  });

  it("returns [] when no rows", async () => {
    mockState.rows = [];
    await expect(getFundraiserBannerSegments(null)).resolves.toEqual([]);
  });

  it("skips rows missing event_date or orders_close_date", async () => {
    mockState.rows = [
      {
        ...baseRow(),
        id: "bad",
        event_date: "",
        orders_close_date: "2026-06-01",
      },
    ];
    await expect(getFundraiserBannerSegments(null)).resolves.toEqual([]);
  });

  it("multi-event ordering headline", async () => {
    mockState.rows = [
      baseRow({ id: "a", title: "A", event_date: "2026-07-01" }),
      baseRow({ id: "b", title: "B", event_date: "2026-07-02" }),
    ];
    const [seg] = await getFundraiserBannerSegments(null);
    expect(seg?.headline).toBe("Chicken cook — orders open");
    expect(seg?.summary).toContain("A (");
    expect(seg?.summary).toContain("B (");
  });

  it("single ordering uses title headline and pickup location", async () => {
    mockState.rows = [
      baseRow({
        id: "one",
        title: "Spring cook",
        orders_close_at: "2026-05-10T17:00:00.000Z",
        pickup_starts_at: "2026-06-15T17:00:00.000Z",
        pickup_location: "Community Hall",
      }),
    ];
    const [seg] = await getFundraiserBannerSegments(null);
    expect(seg?.headline).toBe("Spring cook — orders open");
    expect(seg?.summary).toContain("Order by");
    expect(seg?.summary).toContain("Pickup");
    expect(seg?.pickupLocation).toBe("Community Hall");
  });

  it("single ordering falls back when instants are invalid strings", async () => {
    mockState.rows = [
      baseRow({
        id: "badfmt",
        orders_close_at: "not-an-iso-date",
        pickup_starts_at: "also-bad",
        orders_close_date: "2026-05-01",
        event_date: "2026-06-15",
      }),
    ];
    const [seg] = await getFundraiserBannerSegments(null);
    // orders_close_at is set but unparsable → falls back to date line (not "end of day" copy).
    expect(seg?.summary).toContain("Order by");
    expect(seg?.summary).toContain("May 1, 2026");
    expect(seg?.summary).toContain("Pickup");
  });

  it("single post-deadline with instant deadline", async () => {
    mockState.rows = [
      baseRow({
        id: "post1",
        title: "Fall cook",
        event_date: "2026-06-20",
        orders_close_date: "2026-03-01",
        orders_close_at: "2026-03-01T18:00:00.000Z",
        pickup_starts_at: "2026-06-20T12:00:00.000Z",
        pickup_location: "Hall",
      }),
    ];
    const [seg] = await getFundraiserBannerSegments(null);
    expect(seg?.kind).toBe("post_deadline");
    expect(seg?.headline).toContain("online ordering closed");
    expect(seg?.summary).toContain("Orders closed");
    expect(seg?.pickupLocation).toBe("Hall");
  });

  it("single post-deadline date-only deadline", async () => {
    mockState.rows = [
      baseRow({
        id: "post2",
        orders_close_at: null,
        orders_close_date: "2026-03-01",
        event_date: "2026-06-20",
      }),
    ];
    const [seg] = await getFundraiserBannerSegments(null);
    expect(seg?.summary).toMatch(/Orders closed/);
  });

  it("multi post-deadline summary joins events", async () => {
    mockState.rows = [
      baseRow({
        id: "p1",
        title: "Cook A",
        orders_close_date: "2026-03-01",
        event_date: "2026-06-20",
        orders_close_at: null,
      }),
      baseRow({
        id: "p2",
        title: "Cook B",
        orders_close_date: "2026-03-02",
        event_date: "2026-06-21",
        orders_close_at: "2026-03-02T12:00:00.000Z",
      }),
    ];
    const [seg] = await getFundraiserBannerSegments(null);
    expect(seg?.headline).toBe(
      "Chicken cook — ordering closed for these dates"
    );
    expect(seg?.summary).toContain("Cook A:");
    expect(seg?.summary).toContain("Cook B:");
  });

  it("emits ordering and post segments in one response", async () => {
    mockState.rows = [
      baseRow({
        id: "open",
        title: "Open cook",
        event_date: "2026-08-01",
        orders_close_date: "2026-07-15",
        orders_close_at: null,
      }),
      baseRow({
        id: "closed",
        title: "Closed cook",
        event_date: "2026-08-15",
        orders_close_date: "2026-03-01",
        orders_close_at: null,
      }),
    ];
    const out = await getFundraiserBannerSegments(null);
    expect(out).toHaveLength(2);
    expect(out.map((s) => s.kind)).toEqual(["ordering", "post_deadline"]);
  });

  it("suppresses paid events", async () => {
    mockState.rows = [baseRow({ id: "paid-ev" })];
    paidMock.mockResolvedValue(new Set(["paid-ev"]));
    await expect(getFundraiserBannerSegments(null)).resolves.toEqual([]);
  });
});
