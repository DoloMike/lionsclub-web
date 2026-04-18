import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Prose } from "@/components/Prose";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Privacy practices for the Lewisport Lions Club website.",
};

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        title="Privacy"
        description="This page will expand when accounts, orders, and analytics are added."
      />
      <Prose>
        <p>
          We respect your privacy. This site is under active development; when
          authentication, fundraising orders, or analytics are enabled, this
          policy will describe what we collect, why, how long we keep it, and
          your choices.
        </p>
        <h2>Today</h2>
        <p>
          Public pages do not require an account. Contact links use your own
          email or phone client—we do not store messages sent through those
          links on this site.
        </p>
      </Prose>
    </>
  );
}
