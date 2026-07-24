// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HancockCountyFairSignupTable } from "@/components/hancock-county-fair/HancockCountyFairSignupTable";
import {
  HANCOCK_COUNTY_FAIR_SIGNUP_ROWS,
  type HancockCountyFairSignupSheetRow,
} from "@/lib/hancock-county-fair-signups";

describe("HancockCountyFairSignupTable", () => {
  it("renders every Hancock County Fair signup row and shows when a row is full", () => {
    const days: HancockCountyFairSignupSheetRow[] = HANCOCK_COUNTY_FAIR_SIGNUP_ROWS.map((row) => ({
      ...row,
      signups:
        row.key === "fair-gate-thursday"
          ? Array.from({ length: 6 }, (_, index) => ({
              id: `signup-${index + 1}`,
              name: `Volunteer ${index + 1}`,
            }))
          : row.key === "lions-booth-friday"
            ? [{ id: "signup-7", name: "Dakota Basham" }]
            : [],
    }));

    render(<HancockCountyFairSignupTable rows={days} addSignup={vi.fn()} />);

    expect(screen.getByRole("table", { name: /hancock county fair 2026 signup sheet/i })).toBeInTheDocument();
    expect(screen.getAllByText("Fair Gate")).toHaveLength(2);
    expect(screen.getAllByText("Lions Booth")).toHaveLength(3);
    expect(screen.getAllByText(/5:00 pm - close/i)).toHaveLength(5);
    expect(screen.getAllByText("Thursday, August 6, 2026")).toHaveLength(2);
    expect(screen.getAllByText("Friday, August 7, 2026")).toHaveLength(2);
    expect(screen.getByText("Saturday, August 8, 2026")).toBeInTheDocument();
    expect(screen.getByText("Volunteer 6")).toBeInTheDocument();
    expect(screen.getByText("Dakota Basham")).toBeInTheDocument();
    expect(screen.getByText(/all 6 spots are filled/i)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /add your name/i })).toHaveLength(4);
    expect(screen.getByRole("button", { name: /shift full/i })).toBeDisabled();
  });

  it("disables signup controls when the backend is unavailable", () => {
    const rows: HancockCountyFairSignupSheetRow[] = HANCOCK_COUNTY_FAIR_SIGNUP_ROWS.map((row) => ({
      ...row,
      signups: [],
    }));

    render(
      <HancockCountyFairSignupTable
        rows={rows}
        addSignup={vi.fn()}
        signupsEnabled={false}
      />,
    );

    expect(screen.getAllByRole("button", { name: /signup unavailable/i })).toHaveLength(5);
    expect(screen.getAllByText(/signup is temporarily unavailable/i)).toHaveLength(5);
  });
});
