import { getPublicSiteUrl } from "@/lib/site-url";
import { defaultDescription, site } from "@/lib/site";

/** Local SEO: NAP-style structured data (Name, Address, Phone — phone omitted if none). */
export function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NGO",
    name: site.name,
    description: defaultDescription,
    url: getPublicSiteUrl(),
    address: {
      "@type": "PostalAddress",
      streetAddress: `${site.address.venue}, ${site.address.street}`,
      addressLocality: site.address.city,
      addressRegion: site.address.state,
      postalCode: site.address.zip,
      addressCountry: "US",
    },
    email: site.contact.email,
    ...(site.contact.phone
      ? { telephone: site.contact.phone }
      : {}),
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Hancock County, Kentucky",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
