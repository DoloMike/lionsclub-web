import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { isStripeConfigured } from "@/lib/env";
import { getOpenFundraiserEvents } from "@/lib/data/fundraiser";
import { ChickenOrderClient } from "./ChickenOrderClient";

export const metadata: Metadata = {
  title: "Order chicken",
  description:
    "Place a chicken cook order and pay online. Pickup details are shown before checkout.",
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
      <PageHeader title="Order chicken" />
      {sp.canceled ? (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
          Checkout was canceled — your order was not saved.
        </div>
      ) : null}
      <ChickenOrderClient events={events} stripeReady={stripeReady} />
    </>
  );
}
