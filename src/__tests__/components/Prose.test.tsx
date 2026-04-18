// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Prose } from "@/components/Prose";

describe("Prose", () => {
  it("renders children inside the prose column", () => {
    render(
      <Prose>
        <p>Hello from prose</p>
      </Prose>
    );
    expect(screen.getByText("Hello from prose")).toBeInTheDocument();
  });
});
