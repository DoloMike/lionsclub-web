import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Prose } from "@/components/Prose";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach the Lewisport Lions Club by email or phone.",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        title="Contact"
        description="We respond to community needs, partnerships, and questions about volunteering. Replace placeholder contact info with your chapter’s real details."
      />
      <Prose>
        <p>
          <strong>Email:</strong>{" "}
          <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
        </p>
        <p>
          <strong>Phone:</strong>{" "}
          <a href={`tel:${site.contact.phone.replace(/\D/g, "")}`}>
            {site.contact.phone}
          </a>
        </p>
        <h2>Online form</h2>
        <p>
          A contact form with spam protection is planned for a later phase. For
          now, please use email or phone.
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
