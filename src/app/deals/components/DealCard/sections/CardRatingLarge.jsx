import React from 'react';
import RatingBadge from '../ui/RatingBadge';
import styles from '../DealCard.module.css';

export default function CardRatingLarge({ deal }) {
    const rating = deal?.ipo_review_rating?.status && deal?.ipo_review_rating?.weighted_composite_score;
    if (!rating) return null;

    return (
        <div className={styles.ratingLargeRow}>
            <div className={styles.ratingLargeScoreWrapper}>
                <span className={styles.ratingLargeScore}>{Number(rating).toFixed(1)}</span>
                <span className={styles.ratingLargeScale}>/ 5</span>
            </div>
            
            <div className={styles.ratingLargeStarsWrapper}>
                <RatingBadge rating={rating} variant="starsWithLabel" />
            </div>
            
            {/* The STRONG BUY pill */}
            <div className={styles.strongBuyPill}>
                STRONG BUY
            </div>
        </div>
    );
}
