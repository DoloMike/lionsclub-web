// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Landing } from "@/components/home/Landing";

describe("Landing", () => {
  it("renders a prominent Heritage Festival 2026 signup callout on the home page", () => {
    render(<Landing />);

    expect(
      screen.getByRole("heading", { name: /heritage festival 2026 signup/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /sign up for heritage festival 2026/i }),
    ).toHaveAttribute("href", "/heritage-festival-2026-signup");
    expect(screen.getByText(/booth setup, festival days, and booth tear down/i)).toBeInTheDocument();
  });
});
