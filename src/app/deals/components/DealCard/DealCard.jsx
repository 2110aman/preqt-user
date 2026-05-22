import React from 'react';
import Link from 'next/link';
import { CARD_THEMES, CARD_LAYOUTS, METRICS_CONFIG, determineVariant } from './config';
import * as Sections from './sections';
import RatingBadge from './ui/RatingBadge';
import Badge from './ui/Badge';
import styles from './DealCard.module.css';

export default function DealCard({
    deal,
    variantOverride,
    isAuthenticated,
    onLoginClick,
    qaCount,
    replies,
    isListView
}) {
    // 1. Determine Variant
    const variantKey = variantOverride || determineVariant(deal);
    const theme = CARD_THEMES[variantKey] || CARD_THEMES.public_standard;
    const layout = CARD_LAYOUTS[variantKey] || CARD_LAYOUTS.public_standard;
    const metrics = METRICS_CONFIG[variantKey] || METRICS_CONFIG.public_standard;

    // Handle Auth Locked State for Private deals
    const hasRatingBadge = layout.ratingStyle !== 'none' && !!(deal?.ipo_review_rating?.status && deal?.ipo_review_rating?.weighted_composite_score);
    const isPrivate = ['private', 'ccps', 'ofs'].includes((deal.deal_type || '').toLowerCase());
    if (isPrivate && !isAuthenticated) {
        return <Sections.HiddenOverlay onLoginClick={onLoginClick} />;
    }

    const isSeriesA = deal?.deal_type?.toLowerCase() === 'series-a';
    const isPrivateDeal = deal?.deal_type?.toLowerCase() === 'private' || isSeriesA;
    const statusKey = deal?.status?.toLowerCase() || 'live';
    const statusMap = {
        live: isSeriesA ? 'Round Open' : 'Live',
        upcoming: 'Upcoming',
        closed: isSeriesA ? 'Round Closed' : 'Closed'
    };
    const shouldRenderStatus = !isPrivateDeal || isSeriesA;

    const content = isListView ? (
        <div className={`${styles.cardContainer} ${styles.listView} ${styles[theme.theme]} ${theme.gradient ? styles[theme.gradient] : ''} ${layout.hasOFSGradient ? styles.ofsCard : ''} ${styles[variantKey] || ''}`}>
            {/* Mobile/Tablet Header: Spans full width above both sections */}
            <div className={`${styles.headerRowWrapper} ${styles.mobileHeaderWrapper}`}>
                <Sections.CardHeader deal={deal} layout={layout} isListView={true} />
                <div className={styles.mobileTopRightRow}>
                    <Sections.CardTags deal={deal} isListView={true} />
                    {deal?.ipo_review_rating?.status && (
                        <RatingBadge
                            rating={deal.ipo_review_rating.weighted_composite_score}
                            variant="pill"
                            isListView={isListView}
                        />
                    )}
                    {shouldRenderStatus && (
                        <Badge color={statusKey} variant="pill" className={styles.mobileOnlyStatusBadge}>
                            <span className={`${styles.statusDot} ${styles[statusKey]}`} />
                            {statusMap[statusKey]}
                        </Badge>
                    )}
                </div>
            </div>

            {/* 1. Left Section: Badges, Company Info, Footer */}
            <div className={styles.leftSection}>
                <div className={`${styles.headerRowWrapper} ${styles.desktopHeaderWrapper}`}>
                    <Sections.CardHeader deal={deal} layout={layout} isListView={true} />
                </div>
                <Sections.CardCompanyInfo deal={deal} isListView={true} />
                <Sections.CardFooter deal={deal} qaCount={qaCount} replies={replies} isListView={true} />
            </div>

            {/* 2. Hero Section: Stacked boxes */}
            <div className={styles.heroSection}>
                <Sections.CardHeroMetrics
                    deal={deal}
                    config={metrics.hero}
                    style="boxes"
                    isListView={true}
                />
            </div>

            {/* 3. Metrics & Tags Section */}
            <div className={styles.mainSection}>
                <div className={styles.topRightRow}>
                    <Sections.CardTags deal={deal} isListView={true} />
                    {deal?.ipo_review_rating?.status && (
                        <RatingBadge
                            rating={deal.ipo_review_rating.weighted_composite_score}
                            variant="pill"
                            isListView={isListView}
                        />
                    )}
                </div>
                <Sections.CardProgress deal={deal} />
                <Sections.CardMetricsGrid
                    deal={deal}
                    config={metrics.grid}
                    isListView={true}
                />
            </div>
        </div>
    ) : (
        <div className={`
            ${styles.cardContainer} 
            ${styles[theme.theme]} 
            ${theme.gradient ? styles[theme.gradient] : ''}
            ${layout.hasOFSGradient ? styles.ofsCard : ''}
            ${styles[variantKey] || ''}
        `}>
            {layout.hasOFSGradient && (
                <img src="/ofsdealGradient.svg" alt="" className={styles.ofsGradient} />
            )}

            <div className={`${styles.headerGroup} ${!hasRatingBadge ? styles.noRating : ''}`}>
                {layout.sections.includes('header') && (
                    <Sections.CardHeader deal={deal} layout={layout} isListView={false} />
                )}

                {layout.sections.includes('header_featured') && (
                    <Sections.CardHeaderFeatured deal={deal} />
                )}

                {layout.sections.includes('companyInfo') && (
                    <Sections.CardCompanyInfo deal={deal} hideAvatar={layout.sections.includes('header_featured')} />
                )}
            </div>

            {layout.sections.includes('tagline') && (
                <p className={styles.tagline}>
                    {deal.tag_line || "No description available"}
                </p>
            )}

            {layout.sections.includes('ratingLarge') && (
                <Sections.CardRatingLarge deal={deal} />
            )}

            {layout.sections.includes('heroMetrics') && (
                <Sections.CardHeroMetrics
                    deal={deal}
                    config={metrics.hero}
                    style={layout.heroStyle}
                />
            )}

            {layout.sections.includes('metricsGrid') && (
                <Sections.CardMetricsGrid
                    deal={deal}
                    config={metrics.grid}
                />
            )}

            {layout.sections.includes('progress') && (
                <Sections.CardProgress deal={deal} />
            )}

            {layout.sections.includes('tags') && (
                <Sections.CardTags deal={deal} />
            )}

            {layout.sections.includes('actionButton') && (
                <Sections.CardActionButton />
            )}

            {layout.sections.includes('footer') && (
                <Sections.CardFooter
                    deal={deal}
                    qaCount={qaCount}
                    replies={replies}
                />
            )}
        </div>
    );

    return (
        <Link href={`/deals/${deal.slug}`} className={styles.cardLink}>
            {content}
        </Link>
    );
}
