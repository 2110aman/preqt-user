import React from 'react';
import styles from '../DealCard.module.css';

export default function CardTags({ deal }) {
    const isUnlisted = deal?.deal_type?.toLowerCase() === 'unlisted';
    const isPublic = deal?.deal_type?.toLowerCase() === 'public';
    const items = (isUnlisted || isPublic) ? (deal?.key_highlights || []) : (deal?.tags || []);
    
    if (!items.length) return null;

    return (
        <div className={styles.tagChips}>
            {items.map((item, index) => (
                <div 
                    key={index} 
                    className={styles.tagChip}
                >
                    {item}
                </div>
            ))}
        </div>
    );
}
