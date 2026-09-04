import React from 'react';
import Badge from '../ui/Badge';
import styles from '../DealCard.module.css';

export default function CardHeaderFeatured({ deal, onTagClick, isListView = false }) {
    const statusRaw = (deal?.hidden_status || '').toLowerCase();
    let statusKey = 'upcoming';
    if (statusRaw === 'live') statusKey = 'live';
    else if (statusRaw === 'closed') statusKey = 'closed';

    const statusMap = {
        live: 'LIVE',
        upcoming: 'UPCOMING',
        closed: 'CLOSED'
    };

    const handleBadgeClick = (tag) => (e) => {
        if (onTagClick && tag) {
            e.preventDefault();
            e.stopPropagation();
            onTagClick(tag);
        }
    };

    const charLimit = isListView ? 25 : 16;

    // Assuming tags are passed as an array of strings in deal.tags
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
                    <div onClick={handleBadgeClick('High Conviction')} style={onTagClick ? { cursor: 'pointer' } : undefined} title="High Conviction">
                        <Badge color="highConviction" variant="pill" className={styles.featureBadge}>
                            HIGH CONVICTION
                        </Badge>
                    </div>
                )}
                {tags.map((tag, idx) => {
                    const tagText = typeof tag === 'string'
                        ? tag.trim()
                        : (tag && typeof tag === 'object' ? (tag.name || tag.tag || tag.label || tag.title || '') : '');
                    if (!tagText) return null;
                    const isHighConviction = tagText === 'HIGH CONVICTION';
                    const displayTag = tagText.length > charLimit
                        ? `${tagText.slice(0, charLimit)}...`
                        : tagText;

                    return (
                        <div key={idx} onClick={handleBadgeClick(tagText)} style={onTagClick ? { cursor: 'pointer' } : undefined} title={tagText}>
                            <Badge color={isHighConviction ? 'highConviction' : 'sme'} variant="solid" className={styles.featureBadge}>
                                {displayTag}
                            </Badge>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
