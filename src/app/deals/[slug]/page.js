import Namedetailsection from "../components/name-section/Namesection";
import { cookies } from "next/headers";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_USER_BASE}admin/api/deals/public/detailsbyslug/${slug}`,
      {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return {
        title: "Deal Not Found",
        description: "Unable to load deal information.",
      };
    }

    const deal = await res.json();

    const dealName = deal?.data?.deal_setpData?.company_name || "";
    const rawDealType =
      deal?.data?.deal_type || deal?.data?.deal_setpData?.deal_type || "";

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
      deal?.data?.deal_setpData?.preqt_summary?.data ||
      deal?.data?.preqt_summary?.data ||
      "";

    const cleanSummary = rawSummary
      ? rawSummary.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim()
      : "";

    const rawTagline =
      deal?.data?.deal_setpData?.tag_line?.data ||
      (typeof deal?.data?.tag_line === "string"
        ? deal?.data?.tag_line
        : deal?.data?.tag_line?.data) ||
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

    const rawTags = Array.isArray(deal?.data?.deal_setpData?.tags?.data)
      ? deal.data.deal_setpData.tags.data
      : Array.isArray(deal?.data?.tags?.data)
      ? deal.data.tags.data
      : Array.isArray(deal?.data?.tags)
      ? deal.data.tags
      : [];

    const rawHighlights = Array.isArray(
      deal?.data?.deal_setpData?.key_highlights?.data
    )
      ? deal.data.deal_setpData.key_highlights.data
      : Array.isArray(deal?.data?.key_highlights?.data)
      ? deal.data.key_highlights.data
      : Array.isArray(deal?.data?.key_highlights)
      ? deal.data.key_highlights
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

    return {
      title,
      description,
      keywords,
      openGraph: {
        title,
        description,
        locale: "en_IN",
        images: [
          {
            url: "/favicon.png",
            width: 1200,
            height: 630,
            alt: `${dealName} - primary preview`,
          },
          ...(
            deal?.data?.deal_overview?.company_intro_images?.data?.map((img) => ({
              url: `${process.env.NEXT_PUBLIC_USER_BASE}admin/${img?.path?.replace("public/", "")}`,
              alt: title,
            })) || []
          ),
        ],
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

  let initialDealData = null;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_USER_BASE}admin/api/deals/public/detailsbyslug/${slug}`,
      {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: "no-store",
      }
    );
    if (res.ok) {
      initialDealData = await res.json();
    }
  } catch (error) {
    console.error("Error fetching deal on server:", error);
  }

  return (
    <div>
      <Namedetailsection slug={slug} initialDealData={initialDealData} />
    </div>
  );
}

