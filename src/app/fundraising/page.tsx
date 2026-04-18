import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Prose } from "@/components/Prose";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Fundraising",
  description:
    "Chicken cook and other fundraisers—ordering, pickup, and payment information.",
};

export default function FundraisingPage() {
  return (
    <>
      <PageHeader
        title="Fundraising"
        description="Our recurring chicken cook is a community tradition. Online ordering will roll out in a later phase; we’ll post dates, pricing, and pickup rules here."
      />
      <Prose>
        <h2>Chicken cook</h2>
        <p>
          Orders may require a member account when online ordering goes live
          (planned). Until then, watch this page or{" "}
          <Link href="/contact">contact us</Link> to ask about the next cook and
          how to reserve.
        </p>
        <p>
          <strong>Payment:</strong> details TBD by the chapter—cash at pickup,
          electronic options, or other methods will be spelled out before
          orders open.
        </p>
        <h2>Other campaigns</h2>
        <p>
          Additional fundraisers will be listed here with clear instructions
          and any terms of sale.
        </p>
      </Prose>
    </>
  );
}
