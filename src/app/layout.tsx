import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProfileProvider } from "@/components/auth/SessionProfileProvider";
import { BackToTop } from "@/components/BackToTop";
import { Footer } from "@/components/Footer";
import { FundraiserOrderBanner } from "@/components/fundraising/FundraiserOrderBanner";
import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";
import { OrganizationJsonLd } from "@/components/JsonLd";
import { getSessionProfile } from "@/lib/auth/get-session";
import { getMeetingSchedule, getSocialLinks } from "@/lib/data/chapter-content";
import {
  getCachedPublicFundraiserBannerSegments,
  getFundraiserBannerSegments,
} from "@/lib/data/fundraiser-banner";
import { LCI_LOGO_DARK_SRC } from "@/lib/brand";
import { getPublicSiteUrl } from "@/lib/site-url";
import { defaultDescription, site } from "@/lib/site";

const siteUrl = getPublicSiteUrl();

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

/**
 * Allow pinch-to-zoom IN (accessibility) but prevent zoom OUT below the
 * initial scale. iOS Safari persists zoom level across navigations within a
 * tab, so a single accidental pinch-out leaves every subsequent page rendered
 * at half-width until the user double-taps to reset. `minimumScale: 1` keeps
 * the user inside the design without disabling zoom-in.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: site.name,
    template: `%s | ${site.shortName}`,
  },
  description: defaultDescription,
  metadataBase: new URL(siteUrl),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: LCI_LOGO_DARK_SRC, type: "image/svg+xml", sizes: "any" },
    ],
    shortcut: "/favicon.ico",
    apple: LCI_LOGO_DARK_SRC,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: site.shortName,
    title: site.name,
    description: defaultDescription,
    url: siteUrl,
  },
  twitter: {
    card: "summary",
    title: site.name,
    description: defaultDescription,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [meetingSchedule, socialLinks, session] = await Promise.all([
    getMeetingSchedule(),
    getSocialLinks(),
    getSessionProfile(),
  ]);

  const fundraiserBannerSegments = session
    ? await getFundraiserBannerSegments(session)
    : await getCachedPublicFundraiserBannerSegments();

  const sessionInitial = {
    status: "ready" as const,
    session,
  };

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
          <SessionProfileProvider initial={sessionInitial}>
            <a href="#main-content" className="skip-link">
              Skip to main content
            </a>
            <Header />
            <FundraiserOrderBanner segments={fundraiserBannerSegments} />
            <main
              id="main-content"
              className="flex-1 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(235,183,0,0.09),transparent_55%)] dark:bg-none"
            >
              {children}
            </main>
            <BackToTop />
            <Footer meetingSchedule={meetingSchedule} socialLinks={socialLinks} />
          </SessionProfileProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
