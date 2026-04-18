import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/get-session", () => ({
  getSessionAdmin: vi.fn(),
}));

vi.mock("@/lib/data/fundraiser-admin-stats", async (importOriginal) => {
  const actual = await importOriginal<
    typeof import("@/lib/data/fundraiser-admin-stats")
  >();
  return {
    ...actual,
    getFundraiserEventForAdmin: vi.fn(),
    getChickenOrdersForEventAdmin: vi.fn(),
  };
});

import { GET } from "@/app/api/admin/fundraiser/[eventId]/orders-csv/route";
import { getSessionAdmin } from "@/lib/auth/get-session";
import {
  getChickenOrdersForEventAdmin,
  getFundraiserEventForAdmin,
} from "@/lib/data/fundraiser-admin-stats";

describe("GET /api/admin/fundraiser/[eventId]/orders-csv", () => {
  it("returns 403 without admin session", async () => {
    vi.mocked(getSessionAdmin).mockResolvedValue(null);
    const res = await GET(new Request("http://localhost/"), {
      params: Promise.resolve({ eventId: "e1" }),
    });
    expect(res.status).toBe(403);
  });

  it("returns 404 when event missing", async () => {
    vi.mocked(getSessionAdmin).mockResolvedValue({ id: "u" } as never);
    vi.mocked(getFundraiserEventForAdmin).mockResolvedValue(null);
    const res = await GET(new Request("http://localhost/"), {
      params: Promise.resolve({ eventId: "e1" }),
    });
    expect(res.status).toBe(404);
  });

  it("returns CSV attachment for valid admin + event", async () => {
    vi.mocked(getSessionAdmin).mockResolvedValue({ id: "u" } as never);
    vi.mocked(getFundraiserEventForAdmin).mockResolvedValue({
      id: "e1",
      title: "Cook",
      slug: "spring-cook",
      event_date: "2026-01-01",
      price_cents_per_unit: 1300,
      inventory_units: 10,
    });
    vi.mocked(getChickenOrdersForEventAdmin).mockResolvedValue([]);

    const res = await GET(new Request("http://localhost/"), {
      params: Promise.resolve({ eventId: "e1" }),
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/csv");
    expect(res.headers.get("Content-Disposition")).toContain("attachment");
    const text = await res.text();
    expect(text).toContain("Customer name");
  });
});
