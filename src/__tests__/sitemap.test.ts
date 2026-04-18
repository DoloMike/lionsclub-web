import { afterEach, describe, expect, it, vi } from "vitest";
import sitemap from "@/app/sitemap";

describe("sitemap", () => {
  afterEach(() => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://test.supabase.co");
  });

  it("emits an entry per path with priorities", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://club.example.org/");
    const entries = sitemap();
    expect(entries.length).toBeGreaterThan(8);
    expect(entries[0]?.url).toBe("https://club.example.org");
    expect(entries[0]?.priority).toBe(1);
    expect(entries[1]?.changeFrequency).toBe("monthly");
  });
});
