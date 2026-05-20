import React from "react";
import styles from "./FundAndTimeline.module.css";
import { useDealStore } from "@/store/dealStore";

const DonutChart = ({ data }) => {
  // Use a fixed set of colors or rotate them
  const colors = ["#927127", "#DACC7C", "#1A1A1A", "#E8E7EE", "#B59131"];
  const strokeWidth = 24;
  const radius = 80;
  const circumference = 2 * Math.PI * radius; // ~502.65
  const visualGap = 5; 
  const dashGap = visualGap + strokeWidth; // 29px gap in path to account for rounded ends
  
  // Calculate total usable circumference for the actual segments
  const totalGapSpace = data.length * dashGap;
  const usableCircumference = circumference - totalGapSpace;

  let currentOffset = 0;

  return (
    <div className={styles.donutContainer}>
      <svg viewBox="0 0 220 220" width="220" height="220" style={{ transform: "rotate(-90deg)" }}>
        {data.map((item, index) => {
          const percentage = parseFloat(item.percentage) || 0;
          const segmentLength = (percentage / 100) * usableCircumference;
          
          // If segment is too small to even show rounded ends properly, we might want to skip or cap it
          if (segmentLength <= 0) return null;

          const strokeDasharray = `${segmentLength} ${circumference}`;
          const strokeDashoffset = -currentOffset;

          // Update offset for next segment: current + length + gap
          currentOffset += (segmentLength + dashGap);

          return (
            <circle
              key={index}
              cx="110"
              cy="110"
              r={radius}
              fill="transparent"
              stroke={colors[index % colors.length]}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      <div className={styles.donutCenter}>
        <span className={styles.sourceLabel}>Source:</span>
        <span className={styles.sourceValue}>Company DRHP</span>
      </div>
    </div>
  );
};

export default function FundAndTimeline() {
  const dealDetails = useDealStore((state) => state.dealDetails);
  
  // Extract Fund Allocation Data
  const utilFundsApi = dealDetails?.data?.deal_overview?.utilisation_of_funds;
  const legacyFundAlloc = dealDetails?.data?.fundraise_future_plans?.fund_allocation?.data;

  const fundAllocationRaw = utilFundsApi?.status && Array.isArray(utilFundsApi?.data) 
    ? utilFundsApi.data 
    : (Array.isArray(legacyFundAlloc) ? legacyFundAlloc : []);

  const fundAllocation = fundAllocationRaw.map((item) => ({
    label: item.label_name || item.category || "Unknown",
    amount_in_cr: parseFloat(item.amount_in_cr) || 0,
    percentage: parseFloat(item.amount_in_percent ?? item.percentage) || 0,
  }));

  const totalAmountCr = fundAllocation.reduce((sum, item) => sum + item.amount_in_cr, 0);
  
  const colors = ["#927127", "#DACC7C", "#1A1A1A", "#E8E7EE", "#B59131"];
  const legendData = fundAllocation.map((item, index) => ({
    color: colors[index % colors.length],
    label: item.label,
    value: `₹${item.amount_in_cr.toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Cr`,
    percent: `${item.percentage.toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
  }));

  // Extract Timeline Data
  const _dealOverview = dealDetails?.data?.deal_overview || {};
  const _dealStepData = dealDetails?.data?.deal_setpData || {};
  const _ipoTimelineRaw = _dealOverview?.ipo_timeline || _dealStepData?.ipo_timeline;
  const ipoTimeline = _ipoTimelineRaw?.data || {};
  
  const timelineConfig = [
    { key: "ipo_open_date", label: "IPO Open Date" },
    { key: "ipo_close_date", label: "IPO Close Date" },
    { key: "tentative_allotment", label: "Tentative Allotment" },
    { key: "initiation_of_refunds", label: "Initiation of Refunds" },
    { key: "credit_of_shares_to_demat", label: "Credit of Shares to Demat" },
    { key: "tentative_listing_date", label: "Tentative Listing Date" },
    { key: "cut_off_time_for_upi_mandate_confirmation", label: "Cut-off time for UPI mandate confirmation" },
  ];

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === "null") return "To Be Announced";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const timelineData = timelineConfig.map(config => {
    const value = ipoTimeline[config.key];
    const isDatePassed = value && new Date(value) < new Date();
    return {
      label: config.label,
      date: formatDate(value),
      completed: !!(value && isDatePassed)
    };
  });

  return (
    <div className={styles.container}>
      {/* Left Card: Fund Allocation */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.title}>Fund Allocation</h2>
          <span className={styles.totalValue}>Total: ₹{totalAmountCr.toFixed(1)} Cr</span>
        </div>

        <div className={styles.chartArea}>
          <DonutChart data={fundAllocation} />
        </div>

        <div className={styles.legendWrapper}>
          {legendData.map((item, i) => (
            <div key={i} className={styles.legendItem}>
              <div className={styles.legendLeft}>
                <span className={styles.dot} style={{ backgroundColor: item.color }}></span>
                <span className={styles.legendLabel}>{item.label}</span>
              </div>
              <div className={styles.legendRight}>
                <span className={styles.legendVal}>{item.value}</span>
                <span className={styles.legendPercent}>({item.percent})</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Card: Timeline */}
      <div className={styles.card}>
        <h2 className={styles.title}>Timeline</h2>
        
        <div className={styles.timelineWrapper}>
          {timelineData.map((step, i) => {
            const isLast = i === timelineData.length - 1;
             return (
               <div key={i} className={`${styles.timelineStep} ${step.completed ? styles.completed : ''}`}>
                 <div className={styles.timelineIconWrapper}>
                   {step.completed ? (
                      <div className={styles.checkIcon}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                   ) : (
                      <div className={styles.grayCirc}></div>
                   )}
                   {!isLast && <div className={`${styles.line} ${step.completed ? styles.lineGold : styles.lineGray}`}></div>}
                 </div>
                 
                 <div className={styles.timelineContent}>
                   <div className={styles.stepLabel}>{step.label}</div>
                   <div className={styles.stepDate}>{step.date}</div>
                 </div>
               </div>
             )
          })}
        </div>
      </div>
    </div>
  );
}
