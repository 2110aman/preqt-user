import React from 'react';
import styles from '../DealCard.module.css';

export default function CardTags({ deal }) {
    const tags = deal?.tags || [];
    if (!tags.length) return null;

    return (
        <div className={styles.tagChips}>
            {tags.map((tag, index) => (
                <div key={index} className={styles.tagChip}>
                    {tag}
                </div>
            ))}
        </div>
    );
}
