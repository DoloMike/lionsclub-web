// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ExternalLink } from "@/components/ExternalLink";

describe("ExternalLink", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("renders internal link without blank target", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://club.example.org");
    render(
      <ExternalLink href="/about" data-testid="link">
        About
      </ExternalLink>
    );
    const el = screen.getByTestId("link");
    expect(el).toHaveAttribute("href", "/about");
    expect(el).not.toHaveAttribute("target", "_blank");
  });

  it("opens off-site https links in a new tab", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://club.example.org");
    render(
      <ExternalLink href="https://www.lionsclubs.org/">
        LCI
      </ExternalLink>
    );
    const el = screen.getByRole("link", { name: "LCI" });
    expect(el).toHaveAttribute("target", "_blank");
    expect(el).toHaveAttribute("rel", "noopener noreferrer");
  });
});
