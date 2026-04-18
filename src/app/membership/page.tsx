import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Prose } from "@/components/Prose";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Membership",
  description:
    "Why join the Lewisport Lions, what to expect at meetings, and future member sign-in.",
};

export default function MembershipPage() {
  return (
    <>
      <PageHeader
        title="Membership"
        description="We’re welcoming, practical, and local. Ask questions, visit a meeting, and see if Lions is a fit for you."
      />
      <Prose>
        <h2>Why join</h2>
        <p>
          You’ll serve alongside neighbors, lead projects that matter here, and
          plug into a global network when it helps—without losing our Hancock
          County focus.
        </p>
        <h2>Meetings</h2>
        <p>{site.meeting.schedule}</p>
        <p>{site.meeting.place}</p>
        <h2>Sign in (coming)</h2>
        <p>
          Member accounts, verified chapter status, and order history are
          planned with Supabase Auth. Until then, reach us through{" "}
          <Link href="/contact">Contact</Link>.
        </p>
        <h2>Next step</h2>
        <p>
          <Link href="/contact">Message the club</Link> to introduce yourself
          or ask for a guest visit.
        </p>
      </Prose>
    </>
  );
}
