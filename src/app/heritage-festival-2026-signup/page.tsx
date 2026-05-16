import type { Metadata } from "next";
import { HeritageFestivalSignupTable } from "@/components/heritage-festival/HeritageFestivalSignupTable";
import { PageHeader } from "@/components/PageHeader";
import { Prose } from "@/components/Prose";
import { addHeritageFestivalSignup } from "@/app/heritage-festival-2026-signup/actions";
import {
  buildEmptyHeritageFestivalSignupSheet,
  getHeritageFestivalSignupSheet,
} from "@/lib/data/heritage-festival-signups";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: "Heritage Festival 2026 sign up",
  description: "Sign up for a Heritage Festival 2026 volunteer day.",
  alternates: { canonical: "/heritage-festival-2026-signup" },
};

export default async function HeritageFestivalSignupPage() {
  let signupsEnabled = isSupabaseConfigured();
  let readFailed = false;
  const days = signupsEnabled
    ? await getHeritageFestivalSignupSheet().catch(() => {
        readFailed = true;
        signupsEnabled = false;
        return buildEmptyHeritageFestivalSignupSheet();
      })
    : buildEmptyHeritageFestivalSignupSheet();

  return (
    <>
      <PageHeader
        title="Heritage Festival 2026 sign up"
        description="Choose a day below, enter your name, and add yourself to the signup sheet."
      />
      <Prose>
        <p>
          Use the signup sheet below to volunteer for Heritage Festival 2026.
          Each row shows the current names for that day and includes a button to
          add your name.
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
        <HeritageFestivalSignupTable
          days={days}
          addSignup={addHeritageFestivalSignup}
          signupsEnabled={signupsEnabled}
        />
      </div>
    </>
  );
}
