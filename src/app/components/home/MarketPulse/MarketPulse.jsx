"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './MarketPulse.module.css';

const DEFAULT_POST = {
  
};

const MarketPulse = () => {
  const [post, setPost] = useState(DEFAULT_POST);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const baseUrl = (process.env.NEXT_PUBLIC_USER_BASE || "").replace(/\/$/, "");
        const url = `${baseUrl}/admin/api/community/live-puls-posts`;
        const res = await fetch(url);
        if (res.ok) {
          const payload = await res.json();
          const list = payload?.data?.data || payload?.data;
          const loadedData = Array.isArray(list) ? list[0] : list;
          if (loadedData && typeof loadedData === "object" && (loadedData.title || loadedData.post_title)) {
            setPost(loadedData);
          }
        }
      } catch (error) {
        console.error("Failed to fetch live pulse post:", error);
      }
    };
    fetchPost();
  }, []);

  const getTimeAgo = (dateString) => {
    if (!dateString) return "2 Hours Ago";
    try {
      const now = new Date();
      const past = new Date(dateString);
      const diffMs = now - past;
      if (isNaN(diffMs) || diffMs < 0) {
        return "Just Now";
      }
      const seconds = Math.floor(diffMs / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) {
        return `${days} Day${days > 1 ? 's' : ''} Ago`;
      }
      if (hours > 0) {
        return `${hours} Hour${hours > 1 ? 's' : ''} Ago`;
      }
      if (minutes > 0) {
        return `${minutes} Minute${minutes > 1 ? 's' : ''} Ago`;
      }
      return "Just Now";
    } catch (error) {
      return "2 Hours Ago";
    }
  };

  const formatDailyUpdate = (timeStr) => {
    if (!timeStr) return "7:30 AM";
    try {
      const parts = timeStr.split(":");
      if (parts.length < 2) return timeStr;
      let hours = parseInt(parts[0], 10);
      const minutes = parts[1];
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${hours}:${minutes} ${ampm}`;
    } catch (error) {
      return "7:30 AM";
    }
  };

  // Safe checks for mapping fields dynamically
  const title = post.title || post.post_title || "Understanding Market Trends in Q2 2026";
  const indexScore = post.index_score !== undefined ? post.index_score : 8.5;
  const updateTime = post.daily_update || post.daily_update_time || "09:30:00";
  const authorName = post.author_name || "John Doe";
  const authorRole = post.author_role || "Senior Investment Analyst";
  const timeAgoString = getTimeAgo(post.updatedAt || post.createdAt);
  
  const headline = Array.isArray(post.post_headlines) && post.post_headlines.length > 0
    ? post.post_headlines[0]
    : post.post_headline || "Favorable for selective investing";

  const slug = post.post_slug || "understanding-market-trends-in-q2-2026";

  return (
    <div className={styles.cardContainer}>
      <div className={styles.headerRow}>
        <div className={styles.liveBadge}>
          LIVE <span className={styles.liveDot}></span> MARKET PULSE
        </div>
        <div className={styles.updateTime}>
          Updates Daily At {formatDailyUpdate(updateTime)}
        </div>
      </div>

      <h2 className={styles.title}>
        {title}
      </h2>

      <div className={styles.middleRow}>
        <div className={styles.scoreSection}>
          <span className={styles.scoreLabel}>PR.QTY INDEX SCORE</span>
          <div className={styles.scoreValueContainer}>
            <span className={styles.scoreValue}>{indexScore}</span>
            <span className={styles.scoreMax}>/ 10</span>
          </div>
        </div>
        
        <div className={styles.favorablePill}>
          <span className={styles.favorableDot}></span>
          {headline.toUpperCase()}
        </div>
      </div>

      <div className={styles.footerRow}>
        <div className={styles.authorInfo}>
          <span>{authorName}, {authorRole}</span>
          <span className={styles.divider}> | </span>
          <span className={styles.timeAgo}>{timeAgoString}</span>
        </div>
        <Link href={`/community/${slug}`} className={styles.viewButton}>
          VIEW MARKET ANALYSIS 
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.5 11.5L11.5 2.5M11.5 2.5H4.5M11.5 2.5V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default MarketPulse;
