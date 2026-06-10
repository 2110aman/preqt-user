"use client";

import React, { useState, useEffect } from "react";
import styles from "./market-analysis.module.css";

export default function MarketAnalysisPage() {
  const [timeStr, setTimeStr] = useState("14:14:25 UTC | MAY 28, 2026");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      
      const hours = String(now.getUTCHours()).padStart(2, "0");
      const minutes = String(now.getUTCMinutes()).padStart(2, "0");
      const seconds = String(now.getUTCSeconds()).padStart(2, "0");
      
      const months = [
        "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
        "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
      ];
      const month = months[now.getUTCMonth()];
      const day = now.getUTCDate();
      const year = now.getUTCFullYear();

      setTimeStr(`${hours}:${minutes}:${seconds} UTC | ${month} ${day}, ${year}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.mainContainer}>
        {/* Header Section */}
        <div className={styles.headerWrap}>

        <header className={styles.headerSection}>
          <div className={styles.headerLeft}>
            <div className={styles.systemRow}>
              <span className={styles.liveBadge}>
                LIVE &bull; MARKET PULSE
              </span>
              <span className={styles.systemVersion}>
                PR.EQT INTEL SYSTEM v4.1
              </span>
            </div>
            
            <h1 className={styles.mainHeading}>
              PR.EQT MARKET INTELLIGENCE <span className={styles.highlightTerminal}>TERMINAL</span>
            </h1>
            
            <p className={styles.subText}>
              Daily Quantitative Snapshots | Indian Macro Securities | Private & Public Venture Data
            </p>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.institutionalPill}>
              <span className={styles.institutionalText}>
                FOR INSTITUTIONAL USE ONLY
              </span>
            </div>

            <div className={styles.clockWrapper}>
              <span className={styles.clockIcon}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M7 3.5V7.2H9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className={styles.clockText}>
                {timeStr}
              </span>
            </div>
          </div>
        </header>
        </div>

        {/* Content Section containing Indices and Score Interpretation */}
        <section className={styles.contentSection}>
          {/* Indices Cards Grid */}
          <div className={styles.indicesGrid}>
            
            {/* Card 1: NIFTY 50 */}
            <article className={styles.indexCard}>
              <h3 className={styles.indexName}>NIFTY 50</h3>
              <div className={styles.priceContainer}>
                <span className={styles.indexPrice}>24,205.10</span>
                <span className={`${styles.changePill} ${styles.negativePill}`}>
                  <span className={styles.arrowIcon}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.arrowNegative}>
                      <path d="M2 2L8 8M8 8H4M8 8V4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  -25.10 (-0.10%)
                </span>
              </div>
              <p className={styles.prevCloseText}>Prev. Close: 23,661.50</p>
              <span className={styles.sourceLabel}>Source: NSE India / nseindia.com</span>
            </article>

            {/* Card 2: GIFT NIFTY */}
            <article className={styles.indexCard}>
              <h3 className={styles.indexName}>GIFT NIFTY</h3>
              <div className={styles.priceContainer}>
                <span className={styles.indexPrice}>24,205.10</span>
                <span className={`${styles.changePill} ${styles.positivePill}`}>
                  <span className={styles.arrowIcon}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.arrowPositive}>
                      <path d="M2 8L8 2M8 2H4M8 2V6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  +78 (+0.31%) VS Prev.Close
                </span>
              </div>
              <p className={styles.prevCloseText}>Prev. Session 3 Close 25,234.50</p>
              <span className={styles.sourceLabel}>Source: NSE India / nseindia.com</span>
            </article>

            {/* Card 3: TENTATIVE OPENING */}
            <article className={styles.indexCard}>
              <h3 className={styles.indexName}>TENTATIVE OPENING</h3>
              <div className={styles.priceContainer}>
                <span className={styles.indexPrice}>24,205.10</span>
                <span className={`${styles.changePill} ${styles.positivePill}`}>
                  <span className={styles.arrowIcon}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.arrowPositive}>
                      <path d="M2 8L8 2M8 2H4M8 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  +78 (+0.31%) VS Prev.Close
                </span>
              </div>
              <p className={styles.prevCloseText}>Nifty Prev. Close: 25,234.80</p>
              <span className={styles.sourceLabel}>Source: NSE India / nseindia.com</span>
            </article>

          </div>

          {/* PR.QTY INDEX SCORE Interpretation Banner */}
          <div className={styles.scoreBanner}>
            <div className={styles.scoreBox}>
              <span className={styles.scoreLabel}>PR.QTY INDEX SCORE</span>
              <div className={styles.scoreValueRow}>
                <span className={styles.scoreMain}>7.4</span>
                <span className={styles.scoreMax}>/ 05</span>
              </div>
              <div className={styles.bullishBadge}>
                <span className={styles.bullishDot}></span>
                BULLISH
              </div>
            </div>

            <div className={styles.interpretationBox}>
              <h4 className={styles.interpretationTitle}>SCORE INTERPRETATION</h4>
              <p className={styles.interpretationText}>
                Current market conditions indicate favorable sentiment with strong domestic institutional flows and stable macro indicators. Volatility remains contained within acceptable ranges.
              </p>
              <div className={styles.signalRow}>
                <span className={styles.signalBullet}>&bull;</span>
                <p className={styles.signalText}>
                  Signal: Balanced risk profile. Accumulate in tranches toward high recovery operators.
                </p>
              </div>
            </div>
          </div>

          {/* Analysis Data Table */}
          <div className={styles.tableContainer}>
            <table className={styles.analysisTable}>
              <thead>
                <tr>
                  <th>Particulars</th>
                  <th>Today</th>
                  <th>1 Day (Prev.)</th>
                  <th>Chg.</th>
                  <th>Signal / Note</th>
                </tr>
              </thead>
              <tbody>
                {/* Row 1: US 10Y Treasury Yield */}
                <tr>
                  <td>
                    <div className={styles.particularsCell}>
                      <span className={styles.particularsTitle}>US 10Y Treasury Yield</span>
                      <span className={styles.particularsSource}>Source: NSE India / nseindia.com</span>
                    </div>
                  </td>
                  <td className={styles.todayCell}>4.25%</td>
                  <td className={styles.prevCell}>4.21%</td>
                  <td className={`${styles.changeCell} ${styles.changePositive}`}>+0.04%</td>
                  <td>
                    <div className={styles.signalCell}>
                      <span className={styles.signalArrow}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.arrowPositive}>
                          <path d="M2 8L8 2M8 2H4M8 2V6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      Easing yields support risk-on sentiment
                    </div>
                  </td>
                </tr>

                {/* Row 2: India G-Sec 10Y Yield */}
                <tr>
                  <td>
                    <div className={styles.particularsCell}>
                      <span className={styles.particularsTitle}>India G-Sec 10Y Yield</span>
                      <span className={styles.particularsSource}>Source: NSE India / nseindia.com</span>
                    </div>
                  </td>
                  <td className={styles.todayCell}>7.04%</td>
                  <td className={styles.prevCell}>4.21%</td>
                  <td className={`${styles.changeCell} ${styles.changeNegative}`}>-0.01%</td>
                  <td>
                    <div className={styles.signalCell}>
                      <span className={styles.signalArrow}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.arrowNegative}>
                          <path d="M2 2L8 8M8 8H4M8 8V4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      Stable domestic rates environment
                    </div>
                  </td>
                </tr>

                {/* Row 3: India VIX */}
                <tr>
                  <td>
                    <div className={styles.particularsCell}>
                      <span className={styles.particularsTitle}>India VIX</span>
                      <span className={styles.particularsSource}>Source: NSE India / nseindia.com</span>
                    </div>
                  </td>
                  <td className={styles.todayCell}>13.62</td>
                  <td className={styles.prevCell}>13.62</td>
                  <td className={`${styles.changeCell} ${styles.changePositive}`}>+0.22%</td>
                  <td>
                    <div className={styles.signalCell}>
                      <span className={styles.signalArrow}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.arrowNegative}>
                          <path d="M2 2L8 8M8 8H4M8 8V4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      Declining volatility indicates calm market
                    </div>
                  </td>
                </tr>

                {/* Row 4: S&P 500 Index */}
                <tr>
                  <td>
                    <div className={styles.particularsCell}>
                      <span className={styles.particularsTitle}>S&P 500 Index</span>
                      <span className={styles.particularsSource}>Source: NSE India / nseindia.com</span>
                    </div>
                  </td>
                  <td className={styles.todayCell}>5,310.20</td>
                  <td className={styles.prevCell}>5,310.20</td>
                  <td className={`${styles.changeCell} ${styles.changeNegative}`}>-5.60</td>
                  <td>
                    <div className={styles.signalCell}>
                      <span className={styles.signalArrow}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.arrowNegative}>
                          <path d="M2 2L8 8M8 8H4M8 8V4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      US equities closed positive
                    </div>
                  </td>
                </tr>

                {/* Row 5: GIFT Nifty */}
                <tr>
                  <td>
                    <div className={styles.particularsCell}>
                      <span className={styles.particularsTitle}>GIFT Nifty</span>
                      <span className={styles.particularsSource}>Source: NSE India / nseindia.com</span>
                    </div>
                  </td>
                  <td className={styles.todayCell}>24,215.00</td>
                  <td className={styles.prevCell}>24,215.00</td>
                  <td className={`${styles.changeCell} ${styles.changePositive}`}>+10.00</td>
                  <td>
                    <div className={styles.signalCell}>
                      <span className={styles.signalArrow}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.arrowPositive}>
                          <path d="M2 8L8 2M8 2H4M8 2V6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      Premium to spot indicates positive sentiment
                    </div>
                  </td>
                </tr>

                {/* Row 6: FII Flow (Net) */}
                <tr>
                  <td>
                    <div className={styles.particularsCell}>
                      <span className={styles.particularsTitle}>FII Flow (Net)</span>
                      <span className={styles.particularsSource}>Source: NSE India / nseindia.com</span>
                    </div>
                  </td>
                  <td className={styles.todayCell}>+₹180.0 Cr</td>
                  <td className={styles.prevCell}>+₹180.0 Cr</td>
                  <td className={`${styles.changeCell} ${styles.changePositive}`}>+₹420.0 Cr</td>
                  <td>
                    <div className={styles.signalCell}>
                      <span className={styles.signalArrow}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.arrowPositive}>
                          <path d="M2 8L8 2M8 2H4M8 2V6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      Strong FII inflows after 3-day selling
                    </div>
                  </td>
                </tr>

                {/* Row 7: DII Flow (Net) */}
                <tr>
                  <td>
                    <div className={styles.particularsCell}>
                      <span className={styles.particularsTitle}>DII Flow (Net)</span>
                      <span className={styles.particularsSource}>Source: NSE India / nseindia.com</span>
                    </div>
                  </td>
                  <td className={styles.todayCell}>+₹1,120.0 Cr</td>
                  <td className={styles.prevCell}>+₹1,120.0 Cr</td>
                  <td className={`${styles.changeCell} ${styles.changeNegative}`}>-₹130.0 Cr</td>
                  <td>
                    <div className={styles.signalCell}>
                      <span className={styles.signalArrow}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.arrowNegative}>
                          <path d="M2 2L8 8M8 8H4M8 8V4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      Consistent domestic buying support
                    </div>
                  </td>
                </tr>

                {/* Row 8: Nifty Put/Call Ratio */}
                <tr>
                  <td>
                    <div className={styles.particularsCell}>
                      <span className={styles.particularsTitle}>Nifty Put/Call Ratio</span>
                      <span className={styles.particularsSource}>Source: NSE India / nseindia.com</span>
                    </div>
                  </td>
                  <td className={styles.todayCell}>1.02</td>
                  <td className={styles.prevCell}>1.02</td>
                  <td className={`${styles.changeCell} ${styles.changeNegative}`}>-0.03</td>
                  <td>
                    <div className={styles.signalCell}>
                      <span className={styles.signalArrow}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.arrowNegative}>
                          <path d="M2 2L8 8M8 8H4M8 8V4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      Bullish bias with call writing dominance
                    </div>
                  </td>
                </tr>

                {/* Row 9: India-US 10Y Yield Spread */}
                <tr>
                  <td>
                    <div className={styles.particularsCell}>
                      <span className={styles.particularsTitle}>India-US 10Y Yield Spread</span>
                      <span className={styles.particularsSource}>Source: NSE India / nseindia.com</span>
                    </div>
                  </td>
                  <td className={styles.todayCell}>2.79%</td>
                  <td className={styles.prevCell}>4.21%</td>
                  <td className={`${styles.changeCell} ${styles.changeNegative}`}>-0.05%</td>
                  <td>
                    <div className={styles.signalCell}>
                      <span className={styles.signalArrow}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.arrowNegative}>
                          <path d="M2 2L8 8M8 8H4M8 8V4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      Stable spread supports currency
                    </div>
                  </td>
                </tr>

                {/* Row 10: INR/USD Exchange Rate */}
                <tr>
                  <td>
                    <div className={styles.particularsCell}>
                      <span className={styles.particularsTitle}>INR/USD Exchange Rate</span>
                      <span className={styles.particularsSource}>Source: NSE India / nseindia.com</span>
                    </div>
                  </td>
                  <td className={styles.todayCell}>83.35</td>
                  <td className={styles.prevCell}>83.35</td>
                  <td className={`${styles.changeCell} ${styles.changePositive}`}>+0.04</td>
                  <td>
                    <div className={styles.signalCell}>
                      <span className={styles.signalArrow}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.arrowPositive}>
                          <path d="M2 8L8 2M8 2H4M8 2V6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      Rupee strengthens on FII inflows
                    </div>
                  </td>
                </tr>

                {/* Row 11: MSCI Emerging Markets Index */}
                <tr>
                  <td>
                    <div className={styles.particularsCell}>
                      <span className={styles.particularsTitle}>MSCI Emerging Markets Index</span>
                      <span className={styles.particularsSource}>Source: NSE India / nseindia.com</span>
                    </div>
                  </td>
                  <td className={styles.todayCell}>1,038.50</td>
                  <td className={styles.prevCell}>1,038.50</td>
                  <td className={`${styles.changeCell} ${styles.changeNegative}`}>-2.70</td>
                  <td>
                    <div className={styles.signalCell}>
                      <span className={styles.signalArrow}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.arrowNegative}>
                          <path d="M2 2L8 8M8 8H4M8 8V4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      EM outperformance continues
                    </div>
                  </td>
                </tr>

                {/* Row 12: Gold Price */}
                <tr>
                  <td>
                    <div className={styles.particularsCell}>
                      <span className={styles.particularsTitle}>Gold Price</span>
                      <span className={styles.particularsSource}>Source: NSE India / nseindia.com</span>
                    </div>
                  </td>
                  <td className={styles.todayCell}>$2,350.00</td>
                  <td className={styles.prevCell}>$2,350.00</td>
                  <td className={`${styles.changeCell} ${styles.changePositive}`}>+$8.00</td>
                  <td>
                    <div className={styles.signalCell}>
                      <span className={styles.signalArrow}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.arrowPositive}>
                          <path d="M2 8L8 2M8 2H4M8 2V6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      Safe-haven demand persists
                    </div>
                  </td>
                </tr>

                {/* Row 13: Crude Oil Price (Brent) */}
                <tr>
                  <td>
                    <div className={styles.particularsCell}>
                      <span className={styles.particularsTitle}>Crude Oil Price (Brent)</span>
                      <span className={styles.particularsSource}>Source: NSE India / nseindia.com</span>
                    </div>
                  </td>
                  <td className={styles.todayCell}>$81.20</td>
                  <td className={styles.prevCell}>$81.20</td>
                  <td className={`${styles.changeCell} ${styles.changePositive}`}>+$0.25</td>
                  <td>
                    <div className={styles.signalCell}>
                      <span className={styles.signalArrow}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.arrowPositive}>
                          <path d="M2 8L8 2M8 2H4M8 2V6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      Cyclical sectors leading rally
                    </div>
                  </td>
                </tr>

                {/* Row 14: Top 2 Sector Gainers */}
                <tr className={styles.specialRow}>
                  <td>
                    <div className={styles.particularsCell}>
                      <span className={styles.particularsTitle}>Top 2 Sector Gainers</span>
                      <span className={styles.particularsSource}>Source: NSE India / nseindia.com</span>
                    </div>
                  </td>
                  <td colSpan="4" className={styles.gainersSpanCell}>
                    <div className={styles.spanningContainer}>
                      <div className={styles.spanningLine}>
                        <span className={styles.spanningHighlightGreen}>Nifty IT +2% -</span>
                        <span className={styles.spanningDesc}>NASDAQ rally overnight</span>
                      </div>
                      <div className={styles.spanningLine}>
                        <span className={styles.spanningHighlightGreen}>Nifty Auto +2% -</span>
                        <span className={styles.spanningDesc}>Strong wholesale numbers</span>
                      </div>
                    </div>
                  </td>
                </tr>

                {/* Row 15: Top 2 Sector Losers */}
                <tr className={styles.specialRow}>
                  <td>
                    <div className={styles.particularsCell}>
                      <span className={styles.particularsTitle}>Top 2 Sector Losers</span>
                      <span className={styles.particularsSource}>Source: NSE India / nseindia.com</span>
                    </div>
                  </td>
                  <td colSpan="4" className={styles.losersSpanCell}>
                    <div className={styles.spanningContainer}>
                      <div className={styles.spanningLine}>
                        <span className={styles.spanningHighlightRed}>Nifty PSU Bank +2% -</span>
                        <span className={styles.spanningDesc}>Profit booking at highs</span>
                      </div>
                      <div className={styles.spanningLine}>
                        <span className={styles.spanningHighlightRed}>Nifty FMCG _0.5% -</span>
                        <span className={styles.spanningDesc}>Defensive rotation fading</span>
                      </div>
                    </div>
                  </td>
                </tr>

                {/* Row 16: Volume Spikes (Nifty/Sensex) */}
                <tr>
                  <td>
                    <div className={styles.particularsCell}>
                      <span className={styles.particularsTitle}>Volume Spikes (Nifty/Sensex)</span>
                      <span className={styles.particularsSource}>Source: NSE India / nseindia.com</span>
                    </div>
                  </td>
                  <td className={styles.todayCell}>$58,420 | Ratio: 1.23x</td>
                  <td className={styles.prevCell}>$58,420 | Ratio: 1.23x</td>
                  <td className={styles.changeCell}>-</td>
                  <td>
                    <div className={styles.signalCell}>
                      <span className={styles.signalArrow}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.arrowNegative}>
                          <path d="M2 2L8 8M8 8H4M8 8V4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      Above-average participation confirms trend
                    </div>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
