import type { Metadata } from "next";
import { HancockCountyFairSignupTable } from "@/components/hancock-county-fair/HancockCountyFairSignupTable";
import { PageHeader } from "@/components/PageHeader";
import { Prose } from "@/components/Prose";
import { addHancockCountyFairSignup } from "@/app/hancock-county-fair-2026-signup/actions";
import {
  buildEmptyHancockCountyFairSignupSheet,
  getHancockCountyFairSignupSheet,
} from "@/lib/data/hancock-county-fair-signups";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: "Hancock County Fair 2026 sign up",
  description: "Sign up for a Hancock County Fair 2026 volunteer assignment.",
  alternates: { canonical: "/hancock-county-fair-2026-signup" },
};

export default async function HancockCountyFairSignupPage() {
  let signupsEnabled = isSupabaseConfigured();
  let readFailed = false;
  const rows = signupsEnabled
    ? await getHancockCountyFairSignupSheet().catch(() => {
        readFailed = true;
        signupsEnabled = false;
        return buildEmptyHancockCountyFairSignupSheet();
      })
    : buildEmptyHancockCountyFairSignupSheet();

  return (
    <>
      <PageHeader
        title="Hancock County Fair 2026 sign up"
        description="Choose a booth assignment below, enter your name, and add yourself to the signup sheet."
      />
      <Prose>
        <p>
          Use the signup sheet below to volunteer for the Hancock County Fair.
          Each assignment has 6 spots available for now and uses the time window
          of 5:00 PM - close.
        </p>
        {!signupsEnabled ? (
          <p>
            {readFailed
              ? "Signup is temporarily unavailable while we reconnect to the signup sheet."
              : "Signup is temporarily unavailable until the site database is fully configured."}
          </p>
        ) : null}
      </Prose>
      <div className="mx-auto mt-6 max-w-5xl px-4 pb-[calc(4rem+env(safe-area-inset-bottom,0px))] sm:mt-10 sm:px-6 lg:px-8">
        <HancockCountyFairSignupTable
          rows={rows}
          addSignup={addHancockCountyFairSignup}
          signupsEnabled={signupsEnabled}
        />
      </div>
    </>
  );
}
