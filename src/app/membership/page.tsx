import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Prose } from "@/components/Prose";
import Link from "next/link";
import { getMeetingSchedule } from "@/lib/data/chapter-content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Membership",
  description:
    "Why join the Lewisport Lions, what to expect at meetings, and future member sign-in.",
};

export default async function MembershipPage() {
  const meetingSchedule = await getMeetingSchedule();

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
        <p className="whitespace-pre-wrap">{meetingSchedule}</p>
        <p>{site.meeting.place}</p>
        <h2>Sign in (optional)</h2>
        <p>
          Accounts are <strong>optional</strong> for most of the site. Use{" "}
          <Link href="/login">Sign in</Link> or <strong>Sign in with Google</strong>{" "}
          in the header if you want a profile for future features (for example,
          hiding fundraiser reminders after you order). New accounts start as{" "}
          <strong>Guest</strong> until the chapter confirms membership.{" "}
          <strong>Admin</strong> access is assigned by the chapter for site
          editors.
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
