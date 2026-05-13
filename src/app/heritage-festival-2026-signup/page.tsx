import type { Metadata } from "next";
import Image from "next/image";
import { HeritageFestivalSignupTable } from "@/components/heritage-festival/HeritageFestivalSignupTable";
import { PageHeader } from "@/components/PageHeader";
import { Prose } from "@/components/Prose";
import { Card } from "@/components/ui/Card";
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
      <div className="mx-auto mt-8 max-w-5xl px-4 sm:px-6 lg:px-8">
        <Card
          padding="lg"
          ring
          className="overflow-hidden border-primary/15 bg-background/95"
        >
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] lg:items-center">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                Heritage Festival booth volunteers
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                Join the Heritage Festival booth crew. Pick the day that works for you and add your name below.
              </p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-border/70 bg-muted/20 shadow-card">
              <Image
                src="/images/heritage-festival-2026.jpg"
                alt="Lions Club volunteers and family gathered around a grill outdoors during a community cookout."
                width={800}
                height={523}
                className="h-full w-full object-cover"
                sizes="(min-width: 1024px) 28rem, 100vw"
                priority
              />
            </div>
          </div>
        </Card>
      </div>
      <div className="mx-auto mt-10 max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
        <HeritageFestivalSignupTable
          days={days}
          addSignup={addHeritageFestivalSignup}
          signupsEnabled={signupsEnabled}
        />
      </div>
    </>
  );
}
