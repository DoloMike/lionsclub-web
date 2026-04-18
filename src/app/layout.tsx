import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BackToTop } from "@/components/BackToTop";
import { Footer } from "@/components/Footer";
import { FundraiserOrderBanner } from "@/components/fundraising/FundraiserOrderBanner";
import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";
import { getSessionProfile } from "@/lib/auth/get-session";
import { OrganizationJsonLd } from "@/components/JsonLd";
import { getMeetingSchedule, getSocialLinks } from "@/lib/data/chapter-content";
import { getFundraiserBannerSegments } from "@/lib/data/fundraiser-banner";
import { defaultDescription, site } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: site.name,
    template: `%s | ${site.shortName}`,
  },
  description: defaultDescription,
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSessionProfile();
  const [meetingSchedule, socialLinks, fundraiserBannerSegments] = await Promise.all([
    getMeetingSchedule(),
    getSocialLinks(),
    getFundraiserBannerSegments(session),
  ]);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <OrganizationJsonLd />
        {process.env.NEXT_PUBLIC_NOINDEX === "true" ? (
          <meta name="robots" content="noindex, nofollow" />
        ) : null}
      </head>
      <body className="relative flex min-h-full flex-col bg-background text-foreground">
        <ThemeProvider>
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <Header session={session} />
          <FundraiserOrderBanner segments={fundraiserBannerSegments} />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <BackToTop />
          <Footer meetingSchedule={meetingSchedule} socialLinks={socialLinks} />
        </ThemeProvider>
      </body>
    </html>
  );
}
