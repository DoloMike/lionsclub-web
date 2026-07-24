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

  it("renders a Hancock County Fair signup banner on the home page", () => {
    render(<Landing />);

    expect(
      screen.getAllByRole("heading", { name: /hancock county fair 2026 sign up/i }),
    ).toHaveLength(2);
    expect(
      screen.getAllByRole("link", { name: /sign up for hancock county fair 2026/i }),
    ).toHaveLength(2);
    expect(
      screen.getAllByRole("link", { name: /sign up for hancock county fair 2026/i })[0],
    ).toHaveAttribute("href", "/hancock-county-fair-2026-signup");
    expect(
      screen.getAllByText(/fair gate and lions booth volunteer spots are open now/i),
    ).toHaveLength(2);
  });
});
