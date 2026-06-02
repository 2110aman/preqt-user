import React from 'react';
import Badge from '../ui/Badge';
import styles from '../DealCard.module.css';

export default function CardHeaderFeatured({ deal }) {
    const statusRaw = (deal?.hidden_status || '').toLowerCase();
    let statusKey = 'upcoming';
    if (statusRaw === 'live') statusKey = 'live';
    else if (statusRaw === 'closed') statusKey = 'closed';

    const statusMap = {
        live: 'LIVE',
        upcoming: 'UPCOMING',
        closed: 'CLOSED'
    };

    // Assuming tags are passed as an array of strings in deal.tags
    // For featured deals, we want to split them into rows or just let them wrap
    // The design shows LIVE + 2 tags on top, 3 tags below.
    const tags = deal.tags || [];
    const shouldRenderStatus = deal?.deal_type?.toLowerCase() === 'public' || deal?.deal_type?.toLowerCase() === 'featured';

    return (
        <div className={styles.headerFeatured}>
            <div className={styles.headerFeaturedRow}>
                {shouldRenderStatus && (
                    <Badge color={statusKey === 'live' ? 'featuredLive' : statusKey} variant="pill" className={styles.featureBadge}>
                        <span className={`${styles.statusDot} ${statusKey === 'live' ? styles.featuredLive : styles[statusKey]}`} />
                        {statusMap[statusKey]}
                    </Badge>
                )}
                {(deal.hight_conviction === true || deal.hight_conviction === "true") && (
                    <Badge color="highConviction" variant="pill" className={styles.featureBadge}>
                        HIGH CONVICTION
                    </Badge>
                )}
                {tags.map((tag, idx) => {
                    const isHighConviction = tag === 'HIGH CONVICTION';
                    return (
                        <Badge key={idx} color={isHighConviction ? 'highConviction' : 'sme'} variant="solid" className={styles.featureBadge}>
                            {tag}
                        </Badge>
                    );
                })}
            </div>
        </div>
    );
}
