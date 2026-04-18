// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Container } from "@/components/Container";

describe("Container", () => {
  it("merges className with layout shell", () => {
    render(
      <Container className="py-1">
        <span>inner</span>
      </Container>
    );
    const inner = screen.getByText("inner");
    expect(inner.parentElement?.className).toContain("max-w-5xl");
    expect(inner.parentElement?.className).toContain("py-1");
  });
});
