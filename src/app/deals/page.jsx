import { cache } from "react";
import { getRobotsDirectives } from "../utils/seoUtils";
import AllDeals from "./components/AllDeals/AllDeals";

const getInitialDeals = cache(async (page = 1, sortBy = "latest") => {
  try {
    const rawBaseUrl = process.env.NEXT_PUBLIC_USER_BASE || "https://api.preqt.club/";
    const baseUrl = rawBaseUrl.replace(/\/$/, "");
    const sortQuery = sortBy ? `&sort_by=${encodeURIComponent(sortBy)}` : "";
    const res = await fetch(`${baseUrl}/admin/api/deals/all-deals/?page=${page}&limit=15&deal_type=[unlisted,public]${sortQuery}`, {
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

export async function generateMetadata({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const pageParam = parseInt(resolvedSearchParams?.page, 10);
  const pageNum = !isNaN(pageParam) && pageParam > 1 ? pageParam : null;

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.preqt.club").replace(/\/$/, "");
  const baseTitle = "Exclusive Private Equity, Pre-IPO & Unlisted Deals | PrEqt";
  const title = pageNum ? `Exclusive Private Equity, Pre-IPO & Unlisted Deals - Page ${pageNum} | PrEqt` : baseTitle;
  const canonical = pageNum ? `${siteUrl}/deals?page=${pageNum}` : `${siteUrl}/deals`;
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
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
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

export default async function Page({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const pageParam = parseInt(resolvedSearchParams?.page, 10);
  const page = !isNaN(pageParam) && pageParam > 0 ? pageParam : 1;
  const sortBy = resolvedSearchParams?.sort_by || resolvedSearchParams?.sortBy || "latest";

  const initialDealsData = await getInitialDeals(page, sortBy);
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
      <AllDeals initialDeals={deals} initialPagination={pagination} initialSort={sortBy} />
    </div>
  );
}

