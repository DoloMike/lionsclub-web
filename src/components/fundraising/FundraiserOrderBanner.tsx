import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import type { FundraiserBannerSegment } from "@/lib/data/fundraiser-banner";
import { googleMapsSearchUrl } from "@/lib/maps-links";

function PickupBannerLocation({ label }: { label: string }) {
  const href = googleMapsSearchUrl(label);
  if (!href) return null;
  return (
    <p className="mt-0.5 text-sm text-warning-foreground/85">
      <strong>Pickup location:</strong>{" "}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-warning-foreground underline-offset-2 hover:underline"
      >
        {label}
      </a>
    </p>
  );
}

/** Site-wide fundraiser banners (ordering CTA vs post-deadline notice). Not dismissible. */
export function FundraiserOrderBanner({
  segments,
}: {
  segments: FundraiserBannerSegment[];
}) {
  if (segments.length === 0) {
    return null;
  }

  return (
    <>
      {segments.map((s) => (
        <div
          key={s.bannerKey}
          className="campaign-banner border-b border-warning-border bg-gradient-to-r from-warning-bg via-warning-bg/85 to-warning-bg ring-1 ring-inset ring-accent/20"
          role="region"
          aria-label="Chicken cook fundraiser"
        >
          <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6 lg:px-8">
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-warning-foreground">
                {s.headline}
              </p>
              {s.summary ? (
                <p className="mt-0.5 text-sm text-warning-foreground/85">
                  {s.summary}
                </p>
              ) : null}
              {s.pickupLocation ? (
                <PickupBannerLocation label={s.pickupLocation} />
              ) : null}
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-3">
              {s.showOrderButton ? (
                <ButtonLink href="/fundraising/order" size="md">
                  Order chickens
                </ButtonLink>
              ) : null}
              <Link
                href="/fundraising"
                className="text-sm font-medium text-warning-foreground/85 underline-offset-4 transition-colors hover:text-warning-foreground hover:underline"
              >
                Details
              </Link>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
