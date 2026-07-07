// src/app/layout.tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import {
  Oswald,
  IBM_Plex_Mono,
  Libre_Baskerville,
  Courier_Prime,
} from "next/font/google";
import Script from "next/script";
import "@/styles/globals.css";
import { getAuthUser } from "@/lib/supabase/access";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/ui/BackToTop";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, organizationJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageTransition } from "@/components/motion/PageTransition";

/*
 * Highrise — display/headline font (self-hosted)
 * LICENSE: see public/fonts/LICENSES.md
 */
const highrise = localFont({
  src: [
    {
      path: "../../public/fonts/highrise-regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/highrise-bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-bebas-neue",
  display: "swap",
});

/*
 * Libre Baskerville — body/editorial serif (restored from earlier system)
 * LICENSE: SIL Open Font License — free for commercial use
 */
const libreBaskerville = Libre_Baskerville({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-libre-baskerville",
  display: "swap",
});

const oswald = Oswald({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-oswald",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

const courierPrime = Courier_Prime({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-typewriter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/og-image.svg"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/logos/favicon-red.svg", type: "image/svg+xml" },
    ],
    apple: "/logos/primary-light.png",
  },
  other: {
    "theme-color": "#0D0C0B",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();

  const navUser = user
    ? {
        email: user.email ?? "",
        displayName: user.user_metadata?.display_name as string | undefined,
      }
    : null;

  const fontVars = [
    highrise.variable,
    libreBaskerville.variable,
    oswald.variable,
    ibmPlexMono.variable,
    courierPrime.variable,
  ].join(" ");

  return (
    <html lang="en" className={fontVars}>
      <body className="grain flex min-h-screen flex-col bg-bmj-black text-bmj-cream">
        <JsonLd data={organizationJsonLd()} />
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Navbar user={navUser} />
        <main id="main-content" className="flex-1">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
        <BackToTop />
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
          <Script
            defer
            data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.js"
          />
        )}
      </body>
    </html>
  );
}
