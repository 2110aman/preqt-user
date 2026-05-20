"use client";
import React from 'react';
import styles from './MarketPulse.module.css';

const MarketPulse = () => {
  return (
    <div className={styles.cardContainer}>
      <div className={styles.headerRow}>
        <div className={styles.liveBadge}>
          LIVE • MARKET PULSE
        </div>
        <div className={styles.updateTime}>
          Updates Daily At 7:30 AM
        </div>
      </div>

      <h2 className={styles.title}>
        Infra and energy themes are driving current market strength
      </h2>

      <div className={styles.middleRow}>
        <div className={styles.scoreSection}>
          <span className={styles.scoreLabel}>PR.QTY INDEX SCORE</span>
          <div className={styles.scoreValueContainer}>
            <span className={styles.scoreValue}>7.4</span>
            <span className={styles.scoreMax}>/ 10</span>
          </div>
        </div>
        
        <div className={styles.favorablePill}>
          <span className={styles.favorableDot}></span>
          FAVORABLE FOR SELECTIVE INVESTING
        </div>
      </div>

      <div className={styles.footerRow}>
        <div className={styles.authorInfo}>
          <span>Arjun Mehta, Chief Strategist</span>
          <span className={styles.divider}> | </span>
          <span className={styles.timeAgo}>2 Hours Ago</span>
        </div>
        <button className={styles.viewButton}>
          VIEW MARKET ANALYSIS 
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.5 11.5L11.5 2.5M11.5 2.5H4.5M11.5 2.5V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MarketPulse;
