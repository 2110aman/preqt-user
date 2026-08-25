/**
 * Safely format and guard numerical values against null, undefined, NaN, or negative numbers.
 */

export const safeNumber = (val, fallback = 0) => {
  if (val === null || val === undefined) return fallback;
  const num = Number(val);
  if (isNaN(num)) return fallback;
  return num;
};

export const safePositiveNumber = (val, fallback = 0) => {
  const num = safeNumber(val, fallback);
  return Math.max(fallback, num);
};

export const formatDealCountText = (totalDeals, context = "general") => {
  const safeTotal = safePositiveNumber(totalDeals, 0);

  if (context === "remaining") {
    const remaining = Math.max(0, safeTotal - 1);
    return remaining > 0 ? `We have ${remaining} new deal${remaining === 1 ? '' : 's'}` : 'Explore new deals';
  }

  return safeTotal > 0 ? `We have ${safeTotal} new deal${safeTotal === 1 ? '' : 's'}` : 'Explore deals';
};
