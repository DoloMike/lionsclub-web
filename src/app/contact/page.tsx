import type { Metadata } from "next";
import { ExternalLink } from "@/components/ExternalLink";
import { PageHeader } from "@/components/PageHeader";
import { Prose } from "@/components/Prose";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach the Lewisport Lions Club by email.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        title="Contact"
        description="We respond to community needs, partnerships, and questions about volunteering."
      />
      <Prose>
        <p>
          <strong>Email:</strong>{" "}
          <ExternalLink href={`mailto:${site.contact.email}`}>
            {site.contact.email}
          </ExternalLink>
        </p>
        <p className="text-muted-foreground">
          We don’t publish a club phone number — please email us and we’ll get
          back to you.
        </p>
        <h2>Online form</h2>
        <p>
          A contact form with spam protection is planned for a later phase. For
          now, please use email.
        </p>
        <h2>Nonprofit meeting space</h2>
        <p>
          Ask about free meeting space for qualifying nonprofits (limited days
          per year)—include your organization name and preferred dates.
        </p>
      </Prose>
    </>
  );
}
