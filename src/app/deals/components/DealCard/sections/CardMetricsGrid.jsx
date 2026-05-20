import React from 'react';
import styles from '../DealCard.module.css';
import { formatDate } from '@/app/utils/FormatDate';

const formatNumberWithCommas = (num) => {
    if (num === null || num === undefined || num === "TBD") return "TBD";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export default function CardMetricsGrid({ deal, config }) {
    if (!config) return null;

    const formatValue = (value, metric) => {
        if (!value || value === "TBD") return "TBD";

        switch (metric.format) {
            case 'currency':
                return `₹${formatNumberWithCommas(value)}${metric.suffix ? ` ${metric.suffix}` : ''}`;
            case 'multiplier':
                return `${formatNumberWithCommas(value)}x`;
            case 'percent':
                return `${formatNumberWithCommas(value)}%`;
            case 'date':
                return formatDate(value);
            case 'date_short':
                if (!value) return "TBD";
                const d = new Date(value);
                const month = d.toLocaleString('en-US', { month: 'short' });
                const year = d.getFullYear().toString().slice(-2);
                return `${month} '${year}`;
            default:
                return value;
        }
    };

    return (
        <div className={styles.metricsGrid}>
            {config.map((metric, idx) => (
                <div key={idx} className={styles.gridItem}>
                    <span className={styles.gridLabel}>{metric.label}</span>
                    <span className={styles.gridValue}>
                        {formatValue(deal[metric.key], metric)}
                    </span>
                </div>
            ))}
        </div>
    );
}
