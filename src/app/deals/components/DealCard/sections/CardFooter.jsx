import React from 'react';
import AvatarGroup from '../ui/AvatarGroup';
import RatingBadge from '../ui/RatingBadge';
import CardTags from './CardTags';
import styles from '../DealCard.module.css';

function daysUntilLive(liveAt) {
    const liveDate = new Date(liveAt);
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfLive = new Date(liveDate.getFullYear(), liveDate.getMonth(), liveDate.getDate());
    const diffTime = startOfToday - startOfLive;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

const getInitials = (questions = []) => {
    const allReplies = [];
    questions.forEach(q => {
        if (q.replies && q.replies.length > 0) {
            q.replies.forEach(r => {
                allReplies.push({ solver: r.solver, createdAt: r.createdAt });
            });
        }
    });
    allReplies.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return allReplies.slice(0, 5).map(r => {
        if (!r.solver) return "A";
        const parts = r.solver.trim().split(" ");
        let initials = parts[0][0];
        if (parts.length > 1) initials += parts[1][0];
        return initials.toUpperCase();
    });
};

export default function CardFooter({ deal, qaCount, replies, isListView }) {
    const finalQaCount = qaCount !== undefined ? qaCount : (deal?.qa_count || 0);
    const hasQA = finalQaCount > 0;
    const initials = getInitials(replies?.data?.questions_by || []);
    const finalInitials = initials && initials.length > 0 ? initials : (deal?.dummy_initials || []);

    return (
        <div className={styles.footer}>
            <div className={styles.qaContainer}>
                {hasQA ? (
                    <>
                        <span className={styles.qaCount}>{finalQaCount} Q&A</span>
                        <span className={styles.qaSeparator}>•</span>
                        <span className={styles.qaFreshness}>
                            {deal?.qa_freshness ? deal.qa_freshness : `Last ${daysUntilLive(deal?.createdAt || new Date())} Days`}
                        </span>
                    </>
                ) : (
                    <>
                        <span className={styles.qaEmpty}>Do you have any question? Ask now</span>
                        <div className={styles.mobileFooterTags}>
                            <CardTags deal={deal} isListView={true} />
                        </div>
                    </>
                )}
            </div>

            {hasQA && finalInitials.length > 0 && <AvatarGroup initials={finalInitials} />}
        </div>
    );
}
