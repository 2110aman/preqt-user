import Namedetailsection from "../components/name-section/Namesection";
import { cookies } from "next/headers";
import { cache } from "react";

const getDealData = cache(async (slug, token) => {
  try {
    const baseUrl = (process.env.NEXT_PUBLIC_USER_BASE || "").replace(/\/$/, "");
    if (!baseUrl || !slug) return null;
    const res = await fetch(
      `${baseUrl}/admin/api/deals/public/detailsbyslug/${encodeURIComponent(slug)}`,
      {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        next: { revalidate: 60 },
      }
    );
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.error("Error fetching deal on server:", error);
  }
  return null;
});

export async function generateMetadata({ params }) {
  const { slug } = await params;
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

    const title = dealName
      ? dealTypeLabel
        ? `${dealName} - ${dealTypeLabel}`
        : dealName
      : "Deal Details";

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

    const description =
      cleanSummary ||
      cleanTagline ||
      (dealName
        ? `Discover ${dealName} on PrEqt`
        : "Explore detailed deal information.");

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
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  const initialDealData = await getDealData(slug, token);
  const dealData = initialDealData?.data || initialDealData;
  const dealName =
    dealData?.company_name ||
    dealData?.deal_setpData?.company_name ||
    dealData?.deal_overview?.company_name ||
    "Deal Details";

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.preqt.club").replace(/\/$/, "");

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

