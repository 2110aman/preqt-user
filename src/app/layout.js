import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { MultiStepProvider } from "./utils/MultiStepContext";
import { DealTypeProvider } from "./utils/DealTypeContext";
import { Playfair_Display, Inter, Manrope } from "next/font/google";
import Script from "next/script";
import ClientChrome from "./ClientChrome";
import ToastProvider from "./components/ToastProvider";
import ReCaptchaProviderWrapper from "./components/ReCaptchaProviderWrapper";
import { UserProvider } from "./context/UserContext";
import { DealsProvider } from "./context/DealContext";
import { MeetingProvider } from "./context/MeetingContext";
import { getRobotsDirectives } from "./utils/seoUtils";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
  style: ["italic", "normal"],       // <-- REQUIRED for italic
  weight: ["400", "500", "600", "700"], // <-- choose what you need
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#000000",
};

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.preqt.club").replace(
  /\/$/,
  ""
);
const SITE_IMAGE = `${SITE_URL}/favicon.png`;

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: "PrEqt",
  description: "PrEqt - Private Equity Platform",
  robots: getRobotsDirectives(),
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "PrEqt",
    siteName: "PrEqt",
    description: "PrEqt - Private Equity Platform",
    url: SITE_URL,
    type: "website",
    locale: "en_IN",
    images: [{ url: SITE_IMAGE, width: 512, height: 512, alt: "PrEqt logo" }],
  },
  twitter: {
    card: "summary",
    title: "PrEqt",
    images: [SITE_IMAGE],
    description: "PrEqt - Private Equity Platform",
  },
};

import { cookies } from "next/headers";

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const hasAccessToken = cookieStore.has("accessToken");

  return (
    <html lang="en">
      <body className={`${playfair.variable} ${inter.variable} ${manrope.variable}`}>
        {/* Google Tag Manager - Lazy load so it doesn't block initial mobile hydration */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-HFYE65KM18"
          strategy="lazyOnload"
        />

        <Script id="gtag-init" strategy="lazyOnload">
          {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-HFYE65KM18');
        `}
        </Script>
        <ReCaptchaProviderWrapper>
          <MultiStepProvider>
            <DealTypeProvider>
              <DealsProvider> 
                <MeetingProvider>
                  <UserProvider>
                    <ClientChrome initialHasToken={hasAccessToken}>{children}</ClientChrome>
                  </UserProvider>
                </MeetingProvider>
              </DealsProvider>
            </DealTypeProvider>
          </MultiStepProvider>
        </ReCaptchaProviderWrapper>
        <ToastProvider />
      </body>
    </html>
  );
}
