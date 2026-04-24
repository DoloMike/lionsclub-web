import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Prose } from "@/components/Prose";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Privacy practices for the Lewisport Lions Club website.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        title="Privacy"
        description="How we handle information when you browse, sign in, contact us, or place a fundraiser order."
      />
      <Prose>
        <p>
          This site is operated by <strong>{site.name}</strong> for community
          information and chapter programs. This policy describes what we
          collect, why, and your choices. We keep data collection limited to what
          we need to run the site and serve the community.
        </p>

        <h2>What We Collect</h2>
        <h3>Browsing the Public Site</h3>
        <p>
          You can read most pages without an account. Standard server and
          hosting logs may include your IP address, browser type, and pages
          viewed—used for security and troubleshooting, not sold to advertisers.
        </p>

        <h3>Accounts (Sign-In)</h3>
        <p>
          If you use <strong>Sign in with Google</strong> or email sign-in,
          authentication is handled by our identity provider (Supabase Auth).
          We receive a stable user id, email address, and profile basics needed
          to recognize your session. We use this to show appropriate content
          (for example, hiding fundraiser banners when you already have a paid
          order tied to your account) and to protect admin tools.
        </p>

        <h3>Contact</h3>
        <p>
          When you email us using a <code>mailto:</code> link or the contact
          page, your message is handled in your own email app—we do not store
          that message body on this site unless we add a contact form later.
        </p>

        <h3>Fundraising Orders (Chicken Cooks)</h3>
        <p>
          Online orders are completed through <strong>Stripe Checkout</strong>.
          Stripe processes payment card data; we do not store full card numbers
          on our servers. After a successful payment, we store order details
          needed to fulfill pickup: fundraiser event, quantity, prices, contact
          email (and optional phone/name/notes you provided), and a reference
          to the Stripe session so we can reconcile payments.
        </p>

        <h2>Why We Use Data</h2>
        <ul>
          <li>Operate the website and chapter information.</li>
          <li>Authenticate members and chapter administrators.</li>
          <li>Record paid fundraiser orders and communicate pickup.</li>
          <li>Protect against abuse and fix technical issues.</li>
        </ul>

        <h2>Retention</h2>
        <p>
          We keep order and account data as long as needed for chapter
          operations, tax/audit expectations, and dispute resolution. Specific
          retention periods may be tightened as chapter policy evolves.
        </p>

        <h2>Sharing</h2>
        <p>
          We use service providers to run the site: hosting, database (Supabase),
          payments (Stripe), and email sign-in (e.g. Google). They process data
          only to provide those services. We do not sell personal information.
        </p>

        <h2>Your Choices</h2>
        <ul>
          <li>
            You may request access, correction, or deletion of account-related
            data where applicable—contact us at{" "}
            <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>.
          </li>
          <li>
            You can sign out and clear cookies in your browser to end a session.
          </li>
        </ul>

        <h2>Changes</h2>
        <p>
          We may update this policy as features change. Material changes will be
          reflected here with an updated description at the top of this page.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about privacy:{" "}
          <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>.
        </p>
      </Prose>
    </>
  );
}
