import React from 'react';
import styles from '../DealCard.module.css';
import { formatDateMonthDay } from '@/app/utils/FormatDate';

const formatNumberWithCommas = (num) => {
    if (num === null || num === undefined || num === "TBD") return "TBD";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export default function CardHeroMetrics({ deal, config, style }) {
    if (!config || style === 'none') return null;

    const getValue = (metric) => {
        if (metric.keys) {
            for (const key of metric.keys) {
                if (deal[key]) return deal[key];
            }
            return "TBD";
        }
        return deal[metric.key] || "TBD";
    };

    const formatMetricValue = (value, metric) => {
        if (value === "TBD") return "TBD";
        if (metric.format === 'date') {
            return formatDateMonthDay(value);
        }
        return formatNumberWithCommas(value);
    };

    if (style === 'boxes') {
        return (
            <div className={styles.heroBoxes}>
                {config.map((metric, idx) => {
                    const value = getValue(metric);
                    return (
                        <div key={idx} className={styles.heroBox}>
                            <span className={styles.metricLabel}>{metric.label}</span>
                            <span className={styles.metricValue}>
                                {value !== "TBD" && metric.format === "currency" ? "₹" : ""}
                                {formatMetricValue(value, metric)}
                                {value !== "TBD" && metric.suffix ? ` ${metric.suffix}` : ""}
                                {metric.perShare && value !== "TBD" ? <span className={styles.subValue}>/ share</span> : ""}
                                {metric.showGainLoss && deal.estimated_gain_loss && (
                                    <span className={`${styles.gainLoss} ${Number(deal.estimated_gain_loss) < 0 ? styles.loss : styles.gain}`}>
                                        ({Number(deal.estimated_gain_loss) > 0 ? '+' : ''}{deal.estimated_gain_loss}%)
                                    </span>
                                )}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    }

    if (style === 'inline') {
        return (
            <div className={styles.heroInline}>
                {config.map((metric, idx) => {
                    const value = getValue(metric);
                    return (
                        <div key={idx} className={styles.heroInlineItem}>
                            <span className={styles.metricLabel}>{metric.label}</span>
                            <span className={styles.metricValue}>
                                {value !== "TBD" && metric.format === "currency" ? "₹" : ""}
                                {formatMetricValue(value, metric)}
                                {value !== "TBD" && metric.suffix ? ` ${metric.suffix}` : ""}
                                {metric.showGainLoss && deal.estimated_gain_loss && (
                                    <span className={`${styles.gainLoss} ${Number(deal.estimated_gain_loss) < 0 ? styles.loss : styles.gain}`}>
                                        ({Number(deal.estimated_gain_loss) > 0 ? '+' : ''}{deal.estimated_gain_loss}%)
                                    </span>
                                )}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    }

    if (style === 'divided') {
        return (
            <div className={styles.heroDivided}>
                {config.map((metric, idx) => {
                    const value = getValue(metric);
                    return (
                        <React.Fragment key={idx}>
                            <div className={styles.heroDividedItem}>
                                <span className={styles.metricLabel}>{metric.label}</span>
                                <span className={`${styles.metricValue} ${metric.format === 'percent_gain' ? (Number(value) >= 0 ? styles.gain : styles.loss) : ''}`}>
                                    {value !== "TBD" && metric.format === "currency" ? "₹" : ""}
                                    {metric.format === 'percent_gain' && value !== "TBD" && Number(value) > 0 ? '+' : ''}
                                    {formatMetricValue(value, metric)}
                                    {value !== "TBD" && metric.suffix ? ` ${metric.suffix}` : ""}
                                    {metric.format === 'percent_gain' && value !== "TBD" ? '%' : ''}
                                    
                                    {metric.showGainLoss && deal.estimated_gain_loss && (
                                        <span className={`${styles.gainLoss} ${Number(deal.estimated_gain_loss) < 0 ? styles.loss : styles.gain}`}>
                                            ({Number(deal.estimated_gain_loss) > 0 ? '+' : ''}{deal.estimated_gain_loss}%)
                                        </span>
                                    )}
                                </span>
                            </div>
                            {idx < config.length - 1 && <div className={styles.heroDividedSeparator} />}
                        </React.Fragment>
                    );
                })}
            </div>
        );
    }

    return null;
}
