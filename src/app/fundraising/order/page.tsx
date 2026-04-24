import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { isStripeConfigured } from "@/lib/env";
import { getOpenFundraiserEvents } from "@/lib/data/fundraiser";
import { ChickenOrderClient } from "./ChickenOrderClient";

export const metadata: Metadata = {
  title: "Order chicken",
  description:
    "Place a chicken cook order and pay online. Pickup details are shown before checkout.",
  alternates: { canonical: "/fundraising/order" },
};

type Props = {
  searchParams: Promise<{ canceled?: string }>;
};

export default async function ChickenOrderPage({ searchParams }: Props) {
  const events = await getOpenFundraiserEvents();
  const stripeReady = isStripeConfigured();
  const sp = await searchParams;

  return (
    <>
      <PageHeader title="Order Chicken" />
      {sp.canceled ? (
        <div
          className="border-b border-warning-border bg-warning-bg px-4 py-3 text-center text-sm text-warning-foreground"
          role="status"
        >
          Checkout was canceled — your order was not saved.
        </div>
      ) : null}
      <ChickenOrderClient events={events} stripeReady={stripeReady} />
    </>
  );
}
