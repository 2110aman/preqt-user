import React from 'react';
import Badge from '../ui/Badge';
import RatingBadge from '../ui/RatingBadge';
import styles from '../DealCard.module.css';

export default function CardHeader({ deal, layout, isListView, onTagClick }) {
    const statusRaw = (deal?.hidden_status || '').toLowerCase();
    let statusKey = 'upcoming';
    if (statusRaw === 'live') statusKey = 'live';
    else if (statusRaw === 'closed') statusKey = 'closed';
    else if (statusRaw === 'upcoming' || statusRaw === 'up comming' || statusRaw === 'draft') statusKey = 'upcoming';

    const isPrivateDeal = ['private', 'ccps'].includes(deal.deal_type?.toLowerCase());
    const isSeriesA = isPrivateDeal && layout?.heroStyle === 'boxes';

    const statusMap = {
        live: isSeriesA ? 'Round Open' : 'Live',
        upcoming: 'Upcoming',
        closed: isSeriesA ? 'Round Closed' : 'Closed'
    };

    const rating = deal?.ipo_review_rating?.status && deal?.ipo_review_rating?.weighted_composite_score;
    const shouldRenderStatus = deal?.deal_type?.toLowerCase() === 'public';

    const handleBadgeClick = (tag) => (e) => {
        if (onTagClick && tag) {
            e.preventDefault();
            e.stopPropagation();
            onTagClick(tag);
        }
    };

    const charLimit = isListView ? 25 : 16;

    const firstTag = deal?.tags?.[0];
    const firstTagText = typeof firstTag === 'string'
        ? firstTag.trim()
        : (firstTag && typeof firstTag === 'object' ? (firstTag.name || firstTag.tag || firstTag.label || firstTag.title || '') : '');
    const firstTagDisplay = firstTagText.length > charLimit
        ? `${firstTagText.slice(0, charLimit)}...`
        : firstTagText;

    const stageText = typeof deal?.stage === 'string'
        ? deal.stage.trim()
        : (deal?.stage && typeof deal.stage === 'object' ? (deal.stage.name || deal.stage.label || '') : '');
    const stageDisplay = stageText.length > charLimit
        ? `${stageText.slice(0, charLimit)}...`
        : stageText;

    return (
        <div className={styles.headerRow}>
            <div className={styles.leftBadges}>
                {shouldRenderStatus && (
                    <Badge color={statusKey} variant="pill" className={styles.headerStatusBadge}>
                        <span className={`${styles.statusDot} ${styles[statusKey]}`} />
                        {statusMap[statusKey]}
                    </Badge>
                )}

                {deal?.deal_type?.toLowerCase() === 'unlisted' && firstTagText && (
                    <div onClick={handleBadgeClick(firstTagText)} style={onTagClick ? { cursor: 'pointer' } : undefined} title={firstTagText}>
                        <Badge color="sme" variant="pill">
                            {firstTagDisplay}
                        </Badge>
                    </div>
                )}

                {deal?.deal_type?.toLowerCase() === 'public' && firstTagText && (
                    <div onClick={handleBadgeClick(firstTagText)} style={onTagClick ? { cursor: 'pointer' } : undefined} title={firstTagText}>
                        <Badge color="sme" variant="pill">
                            {firstTagDisplay}
                        </Badge>
                    </div>
                )}

                {isPrivateDeal && stageText && (
                    <div onClick={handleBadgeClick(stageText)} style={onTagClick ? { cursor: 'pointer' } : undefined} title={stageText}>
                        <Badge color="preIpoSme" variant="pill">
                            {stageDisplay}
                        </Badge>
                    </div>
                )}
            </div>

            {!isListView && layout?.ratingStyle !== 'none' && rating && (
                <RatingBadge rating={rating} variant={layout.ratingStyle} />
            )}

            {deal.exclusive_deal && (
                <div className={styles.exclusivePill}>Exclusive Deal</div>
            )}
        </div>
    );
}
