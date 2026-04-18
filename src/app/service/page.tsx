import type { Metadata } from "next";
import { ExternalLink } from "@/components/ExternalLink";
import { PageHeader } from "@/components/PageHeader";
import { Prose } from "@/components/Prose";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Service programs",
  description:
    "Vision, hearing, youth, scholarships, and community programs in Hancock County.",
};

export default function ServicePage() {
  return (
    <>
      <PageHeader
        title="What we do"
        description="Programs align with our chapter’s public project list—local first, with ties to Kentucky Lions Eye Foundation and broader Lions initiatives."
      />
      <Prose>
        <h2>Vision &amp; hearing</h2>
        <p>
          We collect used eyeglasses; clean, sort, and repair; and help people
          access exams and glasses. We connect qualifying residents to the{" "}
          <strong>Kentucky Lions Eye Foundation</strong> and surgery when
          eligible. Screenings include the Vision Van (adults) and KidSight for
          young children.
        </p>
        <h2>Youth &amp; education</h2>
        <p>
          Scholarships for Hancock County High School seniors and support for
          youth programs that build opportunity close to home.
        </p>
        <h2>Community &amp; traditions</h2>
        <p>
          Free pancake breakfast on Christmas parade morning; Santa float for
          Lewisport and Hawesville parades; support for Build a Bed, Hancock
          County Fairgrounds, Care and Share, and similar efforts.
        </p>
        <h2>Meeting space</h2>
        <p>
          We can offer meeting space free of charge to qualifying nonprofits for
          a limited number of days per year—contact us to request availability.
        </p>
        <h2>Broader Lions programs</h2>
        <p>
          Leader Dogs for the Blind, Lions Camp Crescendo, and LCIF grants
          complement the work we do locally.
        </p>
        <p>
          <ExternalLink href={site.eClubhouseUrl}>
            Reference: chapter projects (e‑Clubhouse)
          </ExternalLink>
        </p>
      </Prose>
    </>
  );
}
