import React from 'react';
import styles from '../DealCard.module.css';

export default function CardTags({ deal, onTagClick }) {
    const isUnlisted = deal?.deal_type?.toLowerCase() === 'unlisted';
    const isPublic = deal?.deal_type?.toLowerCase() === 'public';
    const items = (isUnlisted || isPublic) ? (deal?.key_highlights || []) : (deal?.tags || []);
    
    if (!items.length) return null;

    return (
        <div className={styles.tagChips}>
            {items.map((item, index) => {
                const itemText = typeof item === 'string'
                    ? item.trim()
                    : (item && typeof item === 'object' ? (item.name || item.tag || item.label || item.title || '') : '');
                if (!itemText) return null;
                return (
                    <div 
                        key={index} 
                        className={styles.tagChip}
                        onClick={(e) => {
                            if (onTagClick) {
                                e.preventDefault();
                                e.stopPropagation();
                                onTagClick(itemText);
                            }
                        }}
                        style={onTagClick ? { cursor: 'pointer' } : undefined}
                    >
                        {itemText}
                    </div>
                );
            })}
        </div>
    );
}
