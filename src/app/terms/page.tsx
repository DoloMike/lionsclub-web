import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Prose } from "@/components/Prose";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms of use for the Lewisport Lions Club website.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <>
      <PageHeader
        title="Terms of use"
        description="General rules for using this site, plus fundraiser ordering terms."
      />
      <Prose>
        <p>
          This website is operated by <strong>{site.name}</strong> for community
          information. By using the site, you agree to these terms. If you do
          not agree, please do not use the site.
        </p>

        <h2>Content</h2>
        <p>
          Information about meetings, events, and programs is provided in good
          faith and may change. Verify important details (dates, times, prices)
          with the chapter when it matters to you.
        </p>

        <h2>Branding</h2>
        <p>
          Lions wordmarks and related branding are subject to Lions Clubs
          International guidelines. Third-party logos appear only with
          permission.
        </p>

        <h2>Fundraiser orders (chicken cooks)</h2>
        <p>
          When online ordering is open, you may place an order through{" "}
          <strong>Stripe Checkout</strong>. By paying, you agree to:
        </p>
        <ul>
          <li>
            Pay the total shown at checkout in U.S. dollars for the quantity and
            unit price listed for that fundraiser event.
          </li>
          <li>
            Understand that your order is recorded in our system only after{" "}
            <strong>payment succeeds</strong>. If you cancel before paying, no
            order is stored.
          </li>
          <li>
            Pick up during the time window and at the location published for that
            event, and bring your email confirmation or proof of purchase if
            requested.
          </li>
          <li>
            Contact the chapter for questions, special circumstances, or
            disputes—see{" "}
            <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a> or{" "}
            <a href="/contact">Contact</a>.
          </li>
        </ul>
        <p>
          <strong>Refunds and changes:</strong> policies for refunds, weather
          cancellations, or pickup changes are set by the chapter and may be
          communicated on the fundraiser page or by email. If you believe a
          charge was made in error, contact us with your Stripe receipt.
        </p>

        <h2>Limitation of liability</h2>
        <p>
          To the extent permitted by law, the chapter and volunteers are not
          liable for indirect damages arising from use of this site. The site is
          provided &quot;as is&quot; without warranties of uninterrupted
          availability.
        </p>

        <h2>Privacy</h2>
        <p>
          See our <a href="/privacy">Privacy</a> policy for how we handle
          personal data, including payments and sign-in.
        </p>

        <h2>Changes</h2>
        <p>
          We may update these terms. Continued use after changes constitutes
          acceptance of the updated terms.
        </p>
      </Prose>
    </>
  );
}
