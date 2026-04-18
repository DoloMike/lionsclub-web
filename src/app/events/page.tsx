import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Prose } from "@/components/Prose";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Upcoming and recurring events—parades, screenings, and fundraisers for the Lewisport Lions.",
};

export default function EventsPage() {
  return (
    <>
      <PageHeader
        title="Events & calendar"
        description="Parades, screenings, fundraisers, and chapter meetings—we’ll list dates here as they’re confirmed."
      />
      <Prose>
        <p>
          <strong>Coming soon:</strong> a simple calendar of public events and
          fundraisers. For now, the best way to stay in touch is to{" "}
          <Link href="/contact">contact the club</Link> or attend a meeting (
          <Link href="/membership">membership</Link>).
        </p>
        <h2>Recurring touchpoints</h2>
        <ul>
          <li>Christmas parade morning pancake breakfast</li>
          <li>Santa float — Lewisport and Hawesville parades</li>
          <li>Vision screenings (Vision Van, KidSight) when scheduled</li>
          <li>Chicken cook fundraisers — see Fundraising</li>
        </ul>
      </Prose>
    </>
  );
}
