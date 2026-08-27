import Link from "next/link";
import PostDetails from "../components/PostDetails";
import Styles from './page.module.css';
import { notFound } from "next/navigation";
import { cache } from "react";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const revalidate = 60;

const FALLBACK_TITLE = "Preqt Community Post";
const FALLBACK_DESCRIPTION =
  "Dive into detailed insights, polls, and conversations from the Preqt community.";
const IMAGE_URL = (
  process.env.NEXT_PUBLIC_IMAGE_URL ||
  process.env.NEXT_PUBLIC_USER_BASE ||
  "https://api.preqt.com"
).replace(/\/+$/, "");
const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  "https://www.preqt.club"
).replace(/\/+$/, "");
const PUBLISHER_NAME = "Preqt";

const normalizeSlug = (input) => {
  if (Array.isArray(input)) return input[0] ?? "";
  return typeof input === "string" ? input : "";
};

const stripHtml = (value) => {
  if (!value || typeof value !== "string") return "";
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
};

const formatDescription = (text) => {
  const source = stripHtml(text || FALLBACK_DESCRIPTION);
  if (!source) return FALLBACK_DESCRIPTION;
  if (source.length > 155) {
    return `${source.slice(0, 152).trim()}...`;
  }
  return source;
};

const ensureTitleLength = (text) => {
  const base = stripHtml(text || FALLBACK_TITLE);
  if (base.length >= 25) return base;
  const suffix = " | Preqt Community";
  const padded = `${base}${suffix}`;
  return padded.length >= 25 ? padded : `${padded} Insights`;
};

// Cached post fetcher to prevent duplicate requests across generateMetadata and Page
const fetchPostBySlug = cache(async (slug) => {
  const normalized = normalizeSlug(slug);
  if (!normalized) return null;
  const baseUrl = (process.env.NEXT_PUBLIC_USER_BASE || "").replace(/\/$/, "");
  if (!baseUrl) return null;

  let authHeader = {};
  let isAuthed = false;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    if (token) {
      authHeader = { Authorization: `Bearer ${token}` };
      isAuthed = true;
    }
  } catch (_e) {
    // static generation context without request cookies
  }

  try {
    const fetchOptions = isAuthed
      ? {
          cache: "no-store",
          headers: {
            Accept: "application/json",
            ...authHeader,
          },
        }
      : {
          next: { revalidate: 60 },
          headers: {
            Accept: "application/json",
          },
        };

    const res = await fetch(
      `${baseUrl}/admin/api/community/posts/slug/${encodeURIComponent(normalized)}`,
      fetchOptions
    );
    if (!res.ok) return null;
    const payload = await res.json();
    const rawData = payload?.data?.data ?? payload?.data ?? payload;
    const post = Array.isArray(rawData) ? rawData[0] : (rawData?.posts?.[0] ?? rawData);
    return post ?? null;
  } catch (error) {
    console.error("Failed to fetch post by slug:", error);
    return null;
  }
});

// SSG: Generate static params for pre-rendering top post slugs at build time
export async function generateStaticParams() {
  const baseUrl = (process.env.NEXT_PUBLIC_USER_BASE || "").replace(/\/$/, "");
  if (!baseUrl) return [];

  try {
    const res = await fetch(`${baseUrl}/admin/api/community/posts?page=1&limit=50`, {
      next: { revalidate: 3600 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const payload = await res.json();
    const rawPosts = Array.isArray(payload?.data?.data)
      ? payload.data.data
      : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.data?.posts)
      ? payload.data.posts
      : Array.isArray(payload?.posts)
      ? payload.posts
      : Array.isArray(payload)
      ? payload
      : [];

    return rawPosts
      .filter((post) => post && post.slug && typeof post.slug === "string")
      .map((post) => ({
        slug: post.slug.trim(),
      }));
  } catch (error) {
    console.error("Failed to generateStaticParams for community posts:", error);
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { slug: rawSlug } = await params;
  const slug = normalizeSlug(rawSlug);
  const post = await fetchPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found | PrEqt",
      description: FALLBACK_DESCRIPTION,
      alternates: {
        canonical: `${SITE_URL}/community/${slug}`,
      },
    };
  }

  const rawTitle = post.title
    ? `${stripHtml(post.title)} | PrEqt`
    : "Community Post | PrEqt";

  const title = rawTitle;
  const description = formatDescription(
    post.excerpt || post.content || FALLBACK_DESCRIPTION
  );

  const rawImage = Array.isArray(post.mediaUrl)
    ? post.mediaUrl[0]
    : post.mediaUrl;

  const image =
    typeof rawImage === "string"
      ? rawImage
      : rawImage?.url;

  const absoluteImage =
    rawImage?.type === "image" || (image && typeof image === "string" && !image.endsWith(".mp4"))
      ? (`${IMAGE_URL}/${image}`).replaceAll("public/", "")
      : `${SITE_URL}/default_meta_image.png`;

  return {
    title,
    description,
    keywords: [
      "Preqt community",
      "pre-ipo investing",
      "private market insights",
      post.title ? stripHtml(post.title) : "",
    ].filter(Boolean),

    openGraph: {
      title,
      description,
      url: `${SITE_URL}/community/${post.slug || slug}`,
      type: "article",
      locale: "en_IN",
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt ?? post.createdAt,
      authors: [post.authorName ?? PUBLISHER_NAME],
      images: [
        {
          url: absoluteImage,
          width: 1200,
          height: 630,
          alt: post.title ? stripHtml(post.title) : "Preqt Community Post",
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteImage],
    },

    authors: [{ name: post.authorName ?? PUBLISHER_NAME }],
    publisher: PUBLISHER_NAME,
    alternates: {
      canonical: `${SITE_URL}/community/${post.slug || slug}`,
    },
  };
}

export default async function CommunityPostPage({ params }) {
  const { slug: rawSlug } = await params;
  const slug = normalizeSlug(rawSlug);
  const metadata = await fetchPostBySlug(slug);

  if (!metadata) {
    notFound();
  }

  const cleanHeadline = stripHtml(metadata.title || FALLBACK_TITLE);
  const cleanBody = stripHtml(metadata.content || metadata.excerpt || FALLBACK_DESCRIPTION);
  const rawImage = Array.isArray(metadata.mediaUrl) ? metadata.mediaUrl[0] : metadata.mediaUrl;
  const imageStr = typeof rawImage === "string" ? rawImage : rawImage?.url;
  const absoluteImage = imageStr
    ? (`${IMAGE_URL}/${imageStr}`).replaceAll("public/", "")
    : `${SITE_URL}/default_meta_image.png`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: cleanHeadline,
            datePublished: metadata.createdAt,
            dateModified: metadata.updatedAt ?? metadata.createdAt,
            author: {
              "@type": "Person",
              name: metadata.authorName ?? PUBLISHER_NAME,
            },
            publisher: {
              "@type": "Organization",
              name: PUBLISHER_NAME,
              url: SITE_URL,
            },
            mainEntityOfPage: `${SITE_URL}/community/${metadata.slug || slug}`,
            articleBody: cleanBody,
            image: [absoluteImage],
            interactionStatistic: {
              "@type": "InteractionCounter",
              interactionType: "https://schema.org/LikeAction",
              userInteractionCount: Number(metadata.likesCount) || 0,
            },
          }),
        }}
      />
      <Link href="/community" className={Styles.backbuttonContainer}>
        <img src="/assets/pictures/backArrow.svg" alt="back arrow" title="Go back" />
        Back
      </Link>
      <div className={Styles.postDealMainContainer}>
        <PostDetails slug={slug} initialPost={metadata} />
      </div>
    </>
  );
}
