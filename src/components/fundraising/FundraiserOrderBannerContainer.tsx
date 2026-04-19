"use client";

import { useEffect, useState } from "react";
import { useSessionProfileState } from "@/components/auth/SessionProfileProvider";
import type { FundraiserBannerSegment } from "@/lib/data/fundraiser-banner";
import { FundraiserOrderBanner } from "@/components/fundraising/FundraiserOrderBanner";
import { FundraiserOrderBannerSkeleton } from "@/components/fundraising/FundraiserOrderBannerSkeleton";

function FundraiserOrderBannerSessionFetch({
  initialSegments,
  userId,
  email,
}: {
  initialSegments: FundraiserBannerSegment[];
  userId: string;
  email: string;
}) {
  const [segments, setSegments] = useState<FundraiserBannerSegment[] | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/me/fundraiser-banner-segments", {
      credentials: "same-origin",
    })
      .then(async (res) => {
        if (!res.ok) return initialSegments;
        const data =
          (await res.json()) as { segments?: FundraiserBannerSegment[] };
        return data.segments ?? initialSegments;
      })
      .then((next) => {
        if (!cancelled) setSegments(next);
      })
      .catch(() => {
        if (!cancelled) setSegments(initialSegments);
      });

    return () => {
      cancelled = true;
    };
  }, [userId, email, initialSegments]);

  if (segments === null) {
    const blocks =
      initialSegments.length > 0 ? initialSegments.length : 1;
    return <FundraiserOrderBannerSkeleton blocks={blocks} />;
  }

  return <FundraiserOrderBanner segments={segments} />;
}

export function FundraiserOrderBannerContainer({
  initialSegments,
}: {
  initialSegments: FundraiserBannerSegment[];
}) {
  const auth = useSessionProfileState();

  if (auth.status !== "ready" || !auth.session) {
    return <FundraiserOrderBanner segments={initialSegments} />;
  }

  return (
    <FundraiserOrderBannerSessionFetch
      key={auth.session.user.id}
      initialSegments={initialSegments}
      userId={auth.session.user.id}
      email={auth.session.user.email ?? ""}
    />
  );
}
