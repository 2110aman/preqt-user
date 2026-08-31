import Namedetailsection from "../components/name-section/Namesection";
import AllDeals from "../components/AllDeals/AllDeals";
import { cookies } from "next/headers";
import { cache } from "react";
import { notFound } from "next/navigation";

export const DEAL_CATEGORIES = {
  "upcoming-ipo": {
    type: "Upcoming",
    label: "Upcoming IPO",
    title: "Upcoming IPO Deals & Issues | PrEqt",
    description: "Discover upcoming IPOs and pre-IPO investment opportunities on PrEqt. Access live analytics, timeline tracking, and issue size details.",
    canonicalPath: "/deals/upcoming-ipo",
  },
  "upcoming": {
    type: "Upcoming",
    label: "Upcoming IPO",
    title: "Upcoming IPO Deals & Issues | PrEqt",
    description: "Discover upcoming IPOs and pre-IPO investment opportunities on PrEqt. Access live analytics, timeline tracking, and issue size details.",
    canonicalPath: "/deals/upcoming-ipo",
  },
  "upcoming-ipos": {
    type: "Upcoming",
    label: "Upcoming IPO",
    title: "Upcoming IPO Deals & Issues | PrEqt",
    description: "Discover upcoming IPOs and pre-IPO investment opportunities on PrEqt. Access live analytics, timeline tracking, and issue size details.",
    canonicalPath: "/deals/upcoming-ipo",
  },
  "ipo": {
    type: "Public",
    label: "IPO Deals",
    title: "Live IPO Deals & Investment Opportunities | PrEqt",
    description: "Access verified IPO opportunities with live GMP, valuation scores, financials, and company analytics on PrEqt.",
    canonicalPath: "/deals/ipo",
  },
  "public": {
    type: "Public",
    label: "IPO Deals",
    title: "Live IPO Deals & Investment Opportunities | PrEqt",
    description: "Access verified IPO opportunities with live GMP, valuation scores, financials, and company analytics on PrEqt.",
    canonicalPath: "/deals/ipo",
  },
  "ipos": {
    type: "Public",
    label: "IPO Deals",
    title: "Live IPO Deals & Investment Opportunities | PrEqt",
    description: "Access verified IPO opportunities with live GMP, valuation scores, financials, and company analytics on PrEqt.",
    canonicalPath: "/deals/ipo",
  },
  "unlisted-shares": {
    type: "Unlisted",
    label: "Unlisted Shares",
    title: "Unlisted Shares & Pre-IPO Investments | PrEqt",
    description: "Invest in verified unlisted company shares, explore valuations, price trends, and financial reports on PrEqt.",
    canonicalPath: "/deals/unlisted-shares",
  },
  "unlisted": {
    type: "Unlisted",
    label: "Unlisted Shares",
    title: "Unlisted Shares & Pre-IPO Investments | PrEqt",
    description: "Invest in verified unlisted company shares, explore valuations, price trends, and financial reports on PrEqt.",
    canonicalPath: "/deals/unlisted-shares",
  },
  "private-deals": {
    type: "Private",
    label: "Private Deals",
    title: "Exclusive Private Equity Deals | PrEqt",
    description: "Explore institutional-grade private equity opportunities and exclusive co-investment deals on PrEqt.",
    canonicalPath: "/deals/private-deals",
  },
  "private": {
    type: "Private",
    label: "Private Deals",
    title: "Exclusive Private Equity Deals | PrEqt",
    description: "Explore institutional-grade private equity opportunities and exclusive co-investment deals on PrEqt.",
    canonicalPath: "/deals/private-deals",
  },
  "startup-deals": {
    type: "Startup",
    label: "Startup Deals",
    title: "Curated Startup Deals & Venture Investments | PrEqt",
    description: "Invest in high-growth startups and venture-backed companies. Verified deal flow for early-stage capital.",
    canonicalPath: "/deals/startup-deals",
  },
  "startup": {
    type: "Startup",
    label: "Startup Deals",
    title: "Curated Startup Deals & Venture Investments | PrEqt",
    description: "Invest in high-growth startups and venture-backed companies. Verified deal flow for early-stage capital.",
    canonicalPath: "/deals/startup-deals",
  },
};

const getInitialDeals = cache(async () => {
  try {
    const rawBaseUrl = process.env.NEXT_PUBLIC_USER_BASE || "https://api.preqt.club/";
    const baseUrl = rawBaseUrl.replace(/\/$/, "");
    const res = await fetch(`${baseUrl}/admin/api/deals/all-deals/?limit=30&page=1`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 60 },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.error("Error fetching initial deals for category SSR:", error);
  }
  return { data: [], pagination: {} };
});

const getDealData = cache(async (slug, token) => {
  try {
    const baseUrl = (process.env.NEXT_PUBLIC_USER_BASE || "https://apistaging.preqt.club").replace(/\/$/, "");
    if (!baseUrl || !slug) return null;
    const res = await fetch(
      `${baseUrl}/admin/api/deals/public/detailsbyslug/${encodeURIComponent(slug)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        next: { revalidate: 60 },
      }
    );
    if (res.ok) {
      const data = await res.json();
      if (data?.data) {
        return data;
      }
    }
  } catch (error) {
    console.error("Error fetching deal on server:", error);
  }
  return null;
});

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.preqt.club").replace(/\/$/, "");

  // 1. Check if slug matches a Deal Category
  const categoryConfig = DEAL_CATEGORIES[slug?.toLowerCase()];
  if (categoryConfig) {
    return {
      title: categoryConfig.title,
      description: categoryConfig.description,
      alternates: {
        canonical: `${siteUrl}${categoryConfig.canonicalPath}`,
      },
      openGraph: {
        title: categoryConfig.title,
        description: categoryConfig.description,
        url: `${siteUrl}${categoryConfig.canonicalPath}`,
        siteName: "PrEqt",
        locale: "en_IN",
        type: "website",
        images: [
          {
            url: `${siteUrl}/logo.png`,
            width: 1200,
            height: 630,
            alt: categoryConfig.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: categoryConfig.title,
        description: categoryConfig.description,
        images: [`${siteUrl}/logo.png`],
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
    };
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  try {
    const deal = await getDealData(slug, token);
    if (!deal) {
      return {
        title: "Deal Details",
        description: "Explore detailed deal information.",
      };
    }

    const dealData = deal?.data || deal;

    const dealName =
      dealData?.company_name ||
      dealData?.deal_setpData?.company_name ||
      dealData?.deal_overview?.company_name ||
      "";

    const rawDealType =
      dealData?.deal_type ||
      dealData?.deal_setpData?.deal_type ||
      dealData?.deal_overview?.deal_type ||
      dealData?.deal_sub_type ||
      "";

    const dealTypeMap = {
      public: "IPO Share",
      ipo: "IPO Share",
      unlisted: "Unlisted Share",
      private: "Private Share",
      ofs: "OFS Share",
      ccps: "CCPS Share",
    };

    const dealTypeLabel =
      dealTypeMap[rawDealType.toLowerCase()] || rawDealType || "";

    const rawSummary =
      dealData?.deal_setpData?.preqt_summary?.data ||
      dealData?.preqt_summary?.data ||
      "";

    const cleanSummary = rawSummary
      ? rawSummary.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim()
      : "";

    const rawTagline =
      dealData?.deal_setpData?.tag_line?.data ||
      (typeof dealData?.tag_line === "string"
        ? dealData?.tag_line
        : dealData?.tag_line?.data) ||
      "";

    const cleanTagline = rawTagline
      ? rawTagline.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim()
      : "";

    const title = dealName
      ? `${dealName} Unlisted Share Price | PrEqt`
      : "Deal Details | PrEqt";

    const description =
      cleanSummary ||
      cleanTagline ||
      (dealName
        ? `Discover ${dealName} unlisted share price, valuation, key financials, and investment analysis on PrEqt.`
        : "Explore detailed deal information on PrEqt.");

    const rawTags = Array.isArray(dealData?.deal_setpData?.tags?.data)
      ? dealData.deal_setpData.tags.data
      : Array.isArray(dealData?.tags?.data)
      ? dealData.tags.data
      : Array.isArray(dealData?.tags)
      ? dealData.tags
      : [];

    const rawHighlights = Array.isArray(
      dealData?.deal_setpData?.key_highlights?.data
    )
      ? dealData.deal_setpData.key_highlights.data
      : Array.isArray(dealData?.key_highlights?.data)
      ? dealData.key_highlights.data
      : Array.isArray(dealData?.key_highlights)
      ? dealData.key_highlights
      : [];

    const combinedItems = [...rawTags, ...rawHighlights]
      .map((item) =>
        typeof item === "string"
          ? item
          : item?.description || item?.name || item?.label || ""
      )
      .filter((item) => Boolean(item && item.trim()));

    const keywordList = combinedItems.map((item) =>
      dealName ? `${dealName} - ${item.trim()}` : item.trim()
    );

    const keywords =
      keywordList.length > 0
        ? keywordList.join(", ")
        : dealName
        ? `${dealName}, Deals, Investments, Opportunities`
        : "Deals, Investments, Opportunities";

    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.preqt.club").replace(/\/$/, "");

    return {
      title,
      description,
      keywords,
      alternates: {
        canonical: `${siteUrl}/deals/${slug}`,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
      openGraph: {
        title,
        description,
        url: `${siteUrl}/deals/${slug}`,
        siteName: "PrEqt",
        locale: "en_IN",
        type: "website",
        images: [
          {
            url: `${siteUrl}/favicon.png`,
            width: 1200,
            height: 630,
            alt: `${dealName} - primary preview`,
          },
          ...(
            dealData?.deal_overview?.company_intro_images?.data?.map((img) => ({
              url: `${process.env.NEXT_PUBLIC_USER_BASE}admin/${img?.path?.replace("public/", "")}`,
              alt: title,
            })) || []
          ),
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    };
  } catch (error) {
    console.error("Error fetching metadata:", error);
    return {
      title: "Deal Details",
      description: "Explore detailed deal information.",
      keywords: "Deals, Investments, Opportunities",
    };
  }
}

export default async function DealPage({ params }) {
  const { slug } = await params;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.preqt.club").replace(/\/$/, "");

  // 1. Check if slug is a Deal Category (e.g. /deals/upcoming-ipo, /deals/unlisted-shares, /deals/ipo)
  const categoryConfig = DEAL_CATEGORIES[slug?.toLowerCase()];
  if (categoryConfig) {
    const initialDealsData = await getInitialDeals();
    const deals = initialDealsData?.data || [];
    const pagination = initialDealsData?.pagination || {};

    const itemListSchema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": `PrEqt ${categoryConfig.label} Deals`,
      "description": categoryConfig.description,
      "numberOfItems": deals.length,
      "itemListElement": deals.map((deal, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `${siteUrl}/deals/${deal.slug || ""}`,
        "name": deal.company_name || "Investment Opportunity",
        "description": deal.tag_line || deal.company_intro || `${deal.company_name} deal details on PrEqt.`,
      })),
    };

    return (
      <div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />
        <AllDeals initialDeals={deals} initialPagination={pagination} initialCategory={categoryConfig.type} />
      </div>
    );
  }

  // 2. Otherwise render individual Deal Detail Page
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  const initialDealData = await getDealData(slug, token);
  if (!initialDealData) {
    notFound();
  }

  const dealData = initialDealData?.data || initialDealData;
  const dealName =
    dealData?.company_name ||
    dealData?.deal_setpData?.company_name ||
    dealData?.deal_overview?.company_name ||
    "Deal Details";

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": siteUrl,
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Deals",
        "item": `${siteUrl}/deals`,
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": dealName,
        "item": `${siteUrl}/deals/${slug}`,
      },
    ],
  };

  const priceVal =
    dealData?.deal_setpData?.per_share_price?.data ||
    dealData?.deal_setpData?.issue_price_per_share?.data?.from ||
    dealData?.per_share_price?.data;

  const rawDateVal =
    dealData?.deal_setpData?.per_share_price?.as_of_date ||
    dealData?.updatedAt ||
    dealData?.createdAt;

  const financialProductSchema = {
    "@context": "https://schema.org",
    "@type": "FinancialProduct",
    "name": dealName,
    "description":
      dealData?.deal_setpData?.tag_line?.data ||
      dealData?.tag_line ||
      `Explore ${dealName} investment opportunity on PrEqt.`,
    "url": `${siteUrl}/deals/${slug}`,
    "provider": {
      "@type": "Organization",
      "name": "PrEqt",
      "url": siteUrl,
    },
    ...(priceVal
      ? {
          "offers": {
            "@type": "Offer",
            "price": priceVal,
            "priceCurrency": "INR",
            "validFrom": rawDateVal
              ? new Date(rawDateVal).toISOString()
              : new Date().toISOString(),
          },
        }
      : {}),
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(financialProductSchema) }}
      />
      <Namedetailsection slug={slug} initialDealData={initialDealData} />
    </div>
  );
}

