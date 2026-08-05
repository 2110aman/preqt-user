import React from 'react';
import styles from '../DealCard.module.css';
import { formatDateMonthDay, formatFullDate } from '@/app/utils/FormatDate';
import { getMetricDetail } from '../config';

const formatNumberWithCommas = (num) => {
    if (num === null || num === undefined || num === "TBD") return "TBD";
    const parsed = Number(num);
    if (isNaN(parsed)) return num;
    return parsed.toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
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
                return formatFullDate(value);
            case 'date_short':
                if (!value) return "TBD";
                const d = new Date(value);
                if (isNaN(d.getTime())) return value;
                const month = d.toLocaleString('en-US', { month: 'short' });
                const year = d.getFullYear().toString().slice(-2);
                return `${month} '${year}`;
            default:
                return value;
        }
    };

    return (
        <div className={styles.metricsGrid}>
            {config.map((metric, idx) => {
                const { value, label } = getMetricDetail(deal, metric);
                return (
                    <div key={idx} className={styles.gridItem}>
                        <span className={styles.gridLabel}>{label}</span>
                        <span className={styles.gridValue}>
                            {formatValue(value, metric)}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
