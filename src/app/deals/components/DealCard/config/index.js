import { CARD_THEMES } from './themes';
import { CARD_LAYOUTS } from './layouts';
import { METRICS_CONFIG } from './metricsMap';

export { CARD_THEMES, CARD_LAYOUTS, METRICS_CONFIG };

export function determineVariant(deal) {
    const type = (deal.deal_type || '').toLowerCase();
    
    if (type === 'featured') {
        return 'featured_deal';
    }

    if (type === 'public') {
        if (deal.is_deep_dive) return 'public_deep_dive';
        return 'public_standard';
    }

    if (type === 'unlisted' || (type === 'ofs' && (deal.deal_sub_type === null || deal.deal_sub_type === undefined))) {
        return 'unlisted_nse';
    }
    
    if (type === 'ofs') return 'ofs';
    
    if (type === 'private' || type === 'ccps') {
        if (deal.exclusive_deal) return 'pre_ipo_exclusive';
        return 'series_a';
    }
    
    return 'unlisted_nse'; // Default fallback
}
