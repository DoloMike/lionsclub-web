// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FundraiserOrderBanner } from "@/components/fundraising/FundraiserOrderBanner";
import type { FundraiserBannerSegment } from "@/lib/data/fundraiser-banner";

describe("FundraiserOrderBanner", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders nothing when there are no segments", () => {
    const { container } = render(<FundraiserOrderBanner segments={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders headline, order CTA, and details link", () => {
    const segments: FundraiserBannerSegment[] = [
      {
        kind: "ordering",
        bannerKey: "k1",
        headline: "Test cook — orders open",
        summary: "Order by Friday",
        showOrderButton: true,
        pickupLocation: "Lewisport Hall",
      },
    ];
    render(<FundraiserOrderBanner segments={segments} />);
    const region = screen.getByRole("region", {
      name: /Chicken cook fundraiser/i,
    });
    expect(screen.getByText("Test cook — orders open")).toBeInTheDocument();
    expect(
      within(region).getByRole("link", { name: "Order chickens" })
    ).toHaveAttribute("href", "/fundraising/order");
    expect(within(region).getByRole("link", { name: "Details" })).toHaveAttribute(
      "href",
      "/fundraising"
    );
    expect(screen.getByText("Pickup location:")).toBeInTheDocument();
  });

  it("hides order button for post-deadline segment", () => {
    const segments: FundraiserBannerSegment[] = [
      {
        kind: "post_deadline",
        bannerKey: "k2",
        headline: "Closed",
        summary: "Orders closed",
        showOrderButton: false,
      },
    ];
    render(<FundraiserOrderBanner segments={segments} />);
    const region = screen.getByRole("region", {
      name: /Chicken cook fundraiser/i,
    });
    expect(
      within(region).queryByRole("link", { name: "Order chickens" })
    ).toBeNull();
    expect(within(region).getByRole("link", { name: "Details" })).toHaveAttribute(
      "href",
      "/fundraising"
    );
  });
});
