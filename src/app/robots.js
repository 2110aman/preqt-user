import { headers } from 'next/headers';
import { checkIsStaging } from './utils/seoUtils';

export const dynamic = 'force-dynamic';

export default async function robots() {
  const headersList = await headers();
  const host = headersList.get('host') || '';

  const isStaging = checkIsStaging(host);

  if (isStaging) {
    return {
      rules: [
        {
          userAgent: '*',
          disallow: '/',
        },
        {
          userAgent: 'Googlebot',
          disallow: '/',
        },
        {
          userAgent: 'Bingbot',
          disallow: '/',
        },
      ],
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
