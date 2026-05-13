// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HeritageFestivalSignupTable } from "@/components/heritage-festival/HeritageFestivalSignupTable";
import {
  HERITAGE_FESTIVAL_SIGNUP_DAYS,
  type HeritageFestivalSignupSheetDay,
} from "@/lib/heritage-festival-signups";

describe("HeritageFestivalSignupTable", () => {
  it("renders every Heritage Festival signup day with an add-name form", () => {
    const days: HeritageFestivalSignupSheetDay[] = HERITAGE_FESTIVAL_SIGNUP_DAYS.map((day) => ({
      ...day,
      signups: day.date === "2026-05-29" ? [{ id: "signup-1", name: "Dakota Basham" }] : [],
    }));

    render(<HeritageFestivalSignupTable days={days} addSignup={vi.fn()} />);

    expect(screen.getByRole("table", { name: /heritage festival 2026 signup sheet/i })).toBeInTheDocument();
    expect(screen.getByText("Thursday, May 28, 2026")).toBeInTheDocument();
    expect(screen.getByText("Friday, May 29, 2026")).toBeInTheDocument();
    expect(screen.getByText("Saturday, May 30, 2026")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /add your name/i })).toHaveLength(3);
    expect(screen.getByText("Dakota Basham")).toBeInTheDocument();
  });

  it("disables signup controls when the backend is unavailable", () => {
    const days: HeritageFestivalSignupSheetDay[] = HERITAGE_FESTIVAL_SIGNUP_DAYS.map((day) => ({
      ...day,
      signups: [],
    }));

    render(
      <HeritageFestivalSignupTable
        days={days}
        addSignup={vi.fn()}
        signupsEnabled={false}
      />,
    );

    expect(screen.getAllByRole("button", { name: /signup unavailable/i })).toHaveLength(3);
    expect(screen.getAllByText(/signup is temporarily unavailable/i)).toHaveLength(3);
  });
});
