import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/health/route";

describe("GET /api/health", () => {
  it("returns 200", () => {
    const res = GET();
    expect(res.status).toBe(200);
  });

  it("returns { status: ok } body", async () => {
    const res = GET();
    expect(await res.json()).toEqual({ status: "ok" });
  });
});
