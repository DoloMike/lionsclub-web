import Link from "next/link";
import type { FundraiserBannerSegment } from "@/lib/data/fundraiser-banner";
import { googleMapsSearchUrl } from "@/lib/maps-links";

function PickupBannerLocation({ label }: { label: string }) {
  const href = googleMapsSearchUrl(label);
  if (!href) return null;
  return (
    <p className="mt-0.5 text-sm text-amber-900/90 dark:text-amber-200/90">
      <strong>Pickup location:</strong>{" "}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-amber-950 underline-offset-2 hover:underline dark:text-amber-100"
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
          className="campaign-banner border-b border-amber-300/80 bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 ring-1 ring-inset ring-accent/25 dark:border-amber-900/50 dark:from-amber-950/50 dark:via-amber-950/30 dark:to-amber-950/50 dark:ring-accent/20"
          role="region"
          aria-label="Chicken cook fundraiser"
        >
          <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6 lg:px-8">
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-amber-950 dark:text-amber-100">
                {s.headline}
              </p>
              {s.summary ? (
                <p className="mt-0.5 text-sm text-amber-900/90 dark:text-amber-200/90">
                  {s.summary}
                </p>
              ) : null}
              {s.pickupLocation ? (
                <PickupBannerLocation label={s.pickupLocation} />
              ) : null}
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-3">
              {s.showOrderButton ? (
                <Link
                  href="/fundraising/order"
                  className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
                >
                  Order chickens
                </Link>
              ) : null}
              <Link
                href="/fundraising"
                className="text-sm font-medium text-amber-950/80 underline-offset-4 hover:underline dark:text-amber-200/90"
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
