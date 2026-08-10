// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HancockCountyFairSignupClosedPage from "@/app/hancock-county-fair-2026-signup/page";

describe("HancockCountyFairSignupClosedPage", () => {
  it("shows a closed-registration message without a signup form", () => {
    render(<HancockCountyFairSignupClosedPage />);

    expect(
      screen.getByRole("heading", { name: /registration is closed/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/hancock county fair 2026 volunteer signup has ended/i),
    ).toBeInTheDocument();
    expect(screen.queryByRole("form")).not.toBeInTheDocument();
  });
});
