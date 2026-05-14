import type { Metadata } from "next";
import { ExternalLink } from "@/components/ExternalLink";
import { PageHeader } from "@/components/PageHeader";
import { Prose } from "@/components/Prose";
import { SitePhotoBanner } from "@/components/site-photos/SitePhotoBanner";
import { getPublishedSitePhotosBySection } from "@/lib/data/site-photos";
import { isSupabaseConfigured } from "@/lib/env";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Service programs",
  description:
    "Vision, hearing, youth, scholarships, and community programs in Hancock County.",
  alternates: { canonical: "/service" },
};

export default async function ServicePage() {
  const bannerPhotos = isSupabaseConfigured()
    ? await getPublishedSitePhotosBySection("service-banner").catch(() => [])
    : [];

  return (
    <>
      <PageHeader
        title="What We Do"
        description="Programs align with our chapter’s public project list—local first, with ties to Kentucky Lions Eye Foundation and broader Lions initiatives."
      />
      {bannerPhotos.length > 0 ? (
        <SitePhotoBanner
          photos={bannerPhotos}
          ariaLabel="Service photo highlights"
        />
      ) : null}
      <Prose>
        <h2>Vision &amp; Hearing</h2>
        <p>
          We collect used eyeglasses; clean, sort, and repair; and help people
          access exams and glasses. We connect qualifying residents to the{" "}
          <strong>Kentucky Lions Eye Foundation</strong> and surgery when
          eligible. Screenings include the Vision Van (adults) and KidSight for
          young children.
        </p>
        <h2>Youth &amp; Education</h2>
        <p>
          Scholarships for Hancock County High School seniors and support for
          youth programs that build opportunity close to home.
        </p>
        <h2>Community &amp; Traditions</h2>
        <p>
          Free pancake breakfast on Christmas parade morning; Santa float for
          Lewisport and Hawesville parades; support for Build a Bed, Hancock
          County Fairgrounds, Care and Share, and similar efforts.
        </p>
        <h2>Meeting Space</h2>
        <p>
          We can offer meeting space free of charge to qualifying nonprofits for
          a limited number of days per year—contact us to request availability.
        </p>
        <h2>Broader Lions Programs</h2>
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
