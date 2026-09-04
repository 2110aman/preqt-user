import { cache } from "react";
import { getRobotsDirectives } from "../utils/seoUtils";
import AllDeals from "./components/AllDeals/AllDeals";

const getInitialDeals = cache(async () => {
  try {
    const rawBaseUrl = process.env.NEXT_PUBLIC_USER_BASE || "https://api.preqt.club/";
    const baseUrl = rawBaseUrl.replace(/\/$/, "");
    const res = await fetch(`${baseUrl}/admin/api/deals/all-deals/?page=1&limit=500&deal_type=[unlisted,public]`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 60 },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.error("Error fetching initial deals for SSR:", error);
  }
  return { data: [], pagination: {} };
});

export async function generateMetadata() {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.preqt.club").replace(/\/$/, "");
  const title = "Exclusive Private Equity, Pre-IPO & Unlisted Deals | PrEqt";
  const description =
    "Explore verified private equity deals, upcoming IPOs, and unlisted share investment opportunities on PrEqt. Access live analytics and high-conviction deal flow.";

  return {
    title,
    description,
    keywords: [
      "private equity deals",
      "pre-IPO shares",
      "unlisted shares",
      "IPO opportunities",
      "private market investments",
      "startup equity",
      "PrEqt deals",
      "exclusive investment deals"
    ],
    alternates: {
      canonical: `${siteUrl}/deals`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/deals`,
      siteName: "PrEqt",
      locale: "en_IN",
      type: "website",
      images: [
        {
          url: `${siteUrl}/logo.png`,
          width: 1200,
          height: 630,
          alt: "PrEqt Deals",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${siteUrl}/logo.png`],
    },
    robots: getRobotsDirectives(),
  };
}

export default async function Page() {
  const initialDealsData = await getInitialDeals();
  const deals = initialDealsData?.data || [];
  const pagination = initialDealsData?.pagination || {};
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.preqt.club").replace(/\/$/, "");

  // Generate structured JSON-LD schema for ItemList (up to 100 deals)
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "PrEqt Private Equity & Pre-IPO Deals",
    "description": "Browse active private equity, pre-IPO, and unlisted share deals.",
    "numberOfItems": deals.length,
    "itemListElement": deals.map((deal, index) => {
      const dealSlug = deal.slug || "";
      const dealName = deal.company_name || "Investment Opportunity";
      return {
        "@type": "ListItem",
        "position": index + 1,
        "url": `${siteUrl}/deals/${dealSlug}`,
        "name": dealName,
        "description": deal.tag_line || deal.company_intro || `${dealName} deal details on PrEqt platform.`,
      };
    }),
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <AllDeals initialDeals={deals} initialPagination={pagination} />
    </div>
  );
}

