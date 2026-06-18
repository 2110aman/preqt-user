import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function robots() {
  const headersList = await headers();
  const host = headersList.get('host') || '';

  const isStaging =
    host.includes("staging") ||
    host.includes(".vercel.app") ||
    process.env.NEXT_PUBLIC_SITE_URL?.includes("apistaging") ||
    process.env.NEXT_PUBLIC_USER_BASE?.includes("apistaging") ||
    process.env.NEXT_PUBLIC_USER_BASE?.includes("staging");

  if (isStaging) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.preqt.club'}/sitemap.xml`,
  };
}
