import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Prose } from "@/components/Prose";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms of use for the Lewisport Lions Club website.",
};

export default function TermsPage() {
  return (
    <>
      <PageHeader
        title="Terms of use"
        description="General terms for using this site; fundraising terms of sale may be added when ordering goes live."
      />
      <Prose>
        <p>
          This website is operated by {site.name} for community information.
          Content is provided as-is and may change. Event dates, pricing, and
          policies for fundraisers will be confirmed before orders or payments
          are accepted online.
        </p>
        <p>
          Lions wordmarks and related branding are subject to Lions Clubs
          International guidelines; third-party logos appear only with
          permission.
        </p>
      </Prose>
    </>
  );
}
