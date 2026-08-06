import Namedetailsection from "../components/name-section/Namesection";
import { cookies } from "next/headers";
import { cache } from "react";

export const dynamic = "force-dynamic";

const getBaseUrl = () => {
  return (
    process.env.NEXT_PUBLIC_USER_BASE || "https://apistaging.preqt.club/"
  ).replace(/\/$/, "");
};

const formatSlugToTitle = (slug) => {
  if (!slug) return "Deal Details";
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getDealData = cache(async (slug, token) => {
  if (!slug) return null;
  const baseUrl = getBaseUrl();

  try {
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
      return await res.json();
    }
    console.error(`getDealData HTTP ${res.status} for ${slug} on ${baseUrl}`);
  } catch (error) {
    console.error("Error fetching deal on server:", error);
  }
  return null;
});

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  const baseUrl = getBaseUrl();
  const fallbackTitle = formatSlugToTitle(slug);

  try {
    const deal = await getDealData(slug, token);
    const dealData = deal?.data || deal;

    const dealName =
      dealData?.company_name ||
      dealData?.deal_setpData?.company_name ||
      dealData?.deal_overview?.company_name ||
      fallbackTitle;

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

    const title = dealTypeLabel
      ? `${dealName} - ${dealTypeLabel}`
      : `${dealName} - PrEqt`;

    const rawSummary =
      dealData?.deal_setpData?.preqt_summary?.data ||
      dealData?.preqt_summary?.data ||
      dealData?.deal_overview?.company_intro?.data ||
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
      `Explore detailed deal information, financials, and overview for ${dealName} on PrEqt.`;

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
        : `${dealName}, Deals, Investments, Opportunities, Private Equity`;

    return {
      metadataBase: new URL(baseUrl),
      title,
      description,
      keywords,
      openGraph: {
        title,
        description,
        siteName: "PrEqt",
        locale: "en_IN",
        type: "website",
        images: [
          {
            url: "/favicon.png",
            width: 1200,
            height: 630,
            alt: `${dealName} - primary preview`,
          },
          ...(
            dealData?.deal_overview?.company_intro_images?.data?.map((img) => ({
              url: `${baseUrl}/admin/${img?.path?.replace("public/", "")}`,
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
    const title = `${fallbackTitle} - PrEqt`;
    const description = `Explore detailed deal information and overview for ${fallbackTitle} on PrEqt.`;
    return {
      metadataBase: new URL(baseUrl),
      title,
      description,
      keywords: `${fallbackTitle}, Deals, Investments, Opportunities`,
    };
  }
}

export default async function DealPage({ params }) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  const initialDealData = await getDealData(slug, token);

  return (
    <div>
      <Namedetailsection slug={slug} initialDealData={initialDealData} />
    </div>
  );
}

