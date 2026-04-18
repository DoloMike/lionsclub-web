import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Prose } from "@/components/Prose";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `Chapter story, district (${site.district}), and relationship to Lions Clubs International.`,
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="About our chapter"
        description={`${site.name} is a volunteer service organization in ${site.location}. We’re chartered under ${site.district} and part of the global Lions network.`}
      />
      <Prose>
        <p>
          We focus on what Lewisport and Hancock County need most: vision and
          hearing health, young people, hunger and community support, and local
          traditions that bring neighbors together. This site is ours—we tell
          our own story; Lions Clubs International provides the global frame.
        </p>
        <h2>Leadership &amp; governance</h2>
        <p>
          Officer names and photos can be added here once approved. Decisions
          are made by members and leaders who live in the community.
        </p>
        <h2>Lions Clubs International</h2>
        <p>
          Lions is the world’s largest service club organization. LCIF (Lions
          Clubs International Foundation) funds humanitarian work worldwide. We’re
          proud to be part of that network—and we lead with local impact first.
        </p>
        <p>
          <a href={site.lcifUrl} rel="noopener noreferrer" target="_blank">
            Learn about LCIF
          </a>
        </p>
      </Prose>
    </>
  );
}
