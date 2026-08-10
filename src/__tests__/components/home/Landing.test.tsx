// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Landing } from "@/components/home/Landing";

describe("Landing", () => {
  it("does not render a Heritage Festival signup callout on the home page", () => {
    render(<Landing />);

    expect(
      screen.queryByRole("heading", { name: /heritage festival 2026 signup/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /sign up for heritage festival 2026/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/booth setup, festival days, and booth tear down/i)).not.toBeInTheDocument();
  });

  it("does not render a Hancock County Fair signup banner on the home page", () => {
    render(<Landing />);

    expect(
      screen.queryByRole("heading", { name: /hancock county fair 2026 sign up/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /sign up for hancock county fair 2026/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/fair gate and lions booth volunteer spots are open now/i),
    ).not.toBeInTheDocument();
  });
});
