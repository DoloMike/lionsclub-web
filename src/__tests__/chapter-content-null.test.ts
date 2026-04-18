import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/public-server", () => ({
  createPublicServerClient: () => null,
}));

import { getSocialLinks } from "@/lib/data/chapter-content";
import { defaultSocialLinks } from "@/lib/site";

describe("chapter-content without Supabase", () => {
  it("getSocialLinks maps defaultSocialLinks to rows", async () => {
    const links = await getSocialLinks();
    expect(links).toHaveLength(defaultSocialLinks.length);
    expect(links[0]?.label).toBe(defaultSocialLinks[0]?.label);
  });
});
