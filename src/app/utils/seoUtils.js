/**
 * Utility to determine if the current environment is staging, preview, or development.
 * Used to block search engines and web crawlers from indexing non-production environments.
 */

export const checkIsStaging = (host = '') => {
  const normalizedHost = (host || '').toLowerCase();

  // Explicit production domain check
  const isProdHost = normalizedHost === 'preqt.club' || normalizedHost === 'www.preqt.club';

  const isStagingEnv =
    process.env.VERCEL_ENV === 'preview' ||
    process.env.VERCEL_ENV === 'development' ||
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview' ||
    process.env.NEXT_PUBLIC_SITE_URL?.includes('apistaging') ||
    process.env.NEXT_PUBLIC_SITE_URL?.includes('staging') ||
    process.env.NEXT_PUBLIC_SITE_URL?.includes('vercel.app') ||
    process.env.NEXT_PUBLIC_USER_BASE?.includes('apistaging') ||
    process.env.NEXT_PUBLIC_USER_BASE?.includes('staging') ||
    normalizedHost.includes('staging') ||
    normalizedHost.includes('vercel.app') ||
    normalizedHost.includes('webninjaz.com');

  // If host is provided and it's not production, or staging env detected
  if (normalizedHost && !isProdHost && !normalizedHost.startsWith('localhost:')) {
    return true;
  }

  return Boolean(isStagingEnv);
};

export const getRobotsDirectives = (host = '') => {
  const isStaging = checkIsStaging(host);

  if (isStaging) {
    return {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
        'max-video-preview': -1,
        'max-image-preview': 'none',
        'max-snippet': -1,
      },
    };
  }

  return {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  };
};
