import type { Metadata } from "next";
import { ExternalLink } from "@/components/ExternalLink";
import { PageHeader } from "@/components/PageHeader";
import { Prose } from "@/components/Prose";
import { getOfficers } from "@/lib/data/chapter-content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `Chapter story, district (${site.district}), and relationship to Lions Clubs International.`,
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const officers = await getOfficers();

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
        <h2>Leadership</h2>
        {officers.length === 0 ? (
          <p>
            Officer listings are managed by chapter admins and will appear here
            when published.
          </p>
        ) : (
          <ul>
            {officers.map((o) => (
              <li key={o.id}>
                <strong>{o.name}</strong> — {o.title}
              </li>
            ))}
          </ul>
        )}
        <h2>Lions Clubs International</h2>
        <p>
          Lions is the world’s largest service club organization. LCIF (Lions
          Clubs International Foundation) funds humanitarian work worldwide. We’re
          proud to be part of that network—and we lead with local impact first.
        </p>
        <p>
          <ExternalLink href={site.lcifUrl}>Learn about LCIF</ExternalLink>
        </p>
      </Prose>
    </>
  );
}
