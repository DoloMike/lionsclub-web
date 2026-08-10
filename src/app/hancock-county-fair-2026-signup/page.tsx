import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Prose } from "@/components/Prose";

export const metadata: Metadata = {
  title: "Hancock County Fair 2026 registration closed",
  description: "Registration for the Hancock County Fair 2026 is closed.",
};

export default function HancockCountyFairSignupClosedPage() {
  return (
    <>
      <PageHeader
        title="Registration is closed"
        description="The Hancock County Fair 2026 volunteer signup has ended."
      />
      <Prose>
        <p>Thank you to everyone who volunteered.</p>
      </Prose>
    </>
  );
}
