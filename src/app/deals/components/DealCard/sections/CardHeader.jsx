import React from 'react';
import Badge from '../ui/Badge';
import RatingBadge from '../ui/RatingBadge';
import styles from '../DealCard.module.css';

export default function CardHeader({ deal, layout, isListView }) {
    const statusRaw = (deal?.hidden_status || '').toLowerCase();
    let statusKey = 'upcoming';
    if (statusRaw === 'live') statusKey = 'live';
    else if (statusRaw === 'closed') statusKey = 'closed';
    else if (statusRaw === 'upcoming' || statusRaw === 'up comming' || statusRaw === 'draft') statusKey = 'upcoming';

    const isPrivateDeal = ['private', 'ccps'].includes(deal.deal_type?.toLowerCase());
    const isSeriesA = isPrivateDeal && layout.heroStyle === 'boxes';

    const statusMap = {
        live: isSeriesA ? 'Round Open' : 'Live',
        upcoming: 'Upcoming',
        closed: isSeriesA ? 'Round Closed' : 'Closed'
    };

    const rating = deal?.ipo_review_rating?.status && deal?.ipo_review_rating?.weighted_composite_score;
    const shouldRenderStatus = !isPrivateDeal || isSeriesA;

    return (
        <div className={styles.headerRow}>
            <div className={styles.leftBadges}>
                {shouldRenderStatus && (
                    <Badge color={statusKey} variant="pill">
                        <span className={`${styles.statusDot} ${styles[statusKey]}`} />
                        {statusMap[statusKey]}
                    </Badge>
                )}
                
                {isListView ? (
                    <Badge color="dealType" variant="pill" className={styles.dealTypeHeaderBadge}>
                        {deal.deal_type ? `${deal.deal_type.replace(/deals$/i, '').trim().charAt(0).toUpperCase() + deal.deal_type.replace(/deals$/i, '').trim().slice(1).toLowerCase()} Deals` : 'Public Deals'}
                    </Badge>
                ) : (
                    <>
                        {deal.deal_type?.toLowerCase() === 'public' && (
                            <Badge color="sme" variant="pill">
                                IPO- SME
                            </Badge>
                        )}

                        {isPrivateDeal && (
                            <Badge color="preIpoSme" variant="pill">
                                {deal.stage || 'Pre IPO- SME'}
                            </Badge>
                        )}
                    </>
                )}
            </div>

            {!isListView && layout.ratingStyle !== 'none' && rating && (
                <RatingBadge rating={rating} variant={layout.ratingStyle} />
            )}

            {deal.exclusive_deal && (
                <div className={styles.exclusivePill}>Exclusive Deal</div>
            )}
        </div>
    );
}
