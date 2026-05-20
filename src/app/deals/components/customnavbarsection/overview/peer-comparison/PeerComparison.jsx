"use client";
import React, { useState, useEffect } from "react";
import styles from "./PeerComparison.module.css";
import { useDealStore } from "@/store/dealStore";

const PeerComparison = ({ isPrivateDeal }) => {
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const dealDetails = useDealStore((state) => state.dealDetails);
  
  const dealOverview = dealDetails?.data?.deal_overview;
  const dealStepData = dealDetails?.data?.deal_setpData;
  const peerComparison = dealOverview?.peer_comparison || dealStepData?.peer_comparison;

  if (!peerComparison?.status || !peerComparison?.data || peerComparison.data.length === 0) {
    return null;
  }

  const companies = peerComparison.data;
  const themeClass = isPrivateDeal ? styles.dark : styles.light;

  const formatNumber = (value) => {
    if (value === null || value === undefined || isNaN(Number(value))) return value ?? "-";
    return Number(value).toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };

  const getColumnDivisor = () => {
    if (windowWidth < 550) return 1; // Show 3 columns total (1 metric + 2 companies)
    if (windowWidth < 786) return 3; // Show 4 columns total (1 metric + 3 companies)
    if (windowWidth < 1200 && windowWidth > 920) return 3; // Show 5 columns total (1 metric + 4 companies)
    return 4; // Previous standard behavior (Metric + 4 companies)
  };

  const divisor = getColumnDivisor();

  const metricsConfig = [
    { label: "Revenue", key: "revenue_in_cr", format: (v) => `₹${formatNumber(v)} Cr` },
    { label: "EBITDA Margin", key: "ebitda_margin_percent", format: (v) => `${v}%` },
    { label: "PAT", key: "pat", format: (v) => `₹${formatNumber(v)} Cr` },
    
    { label: "ROE", key: "roe_percent", format: (v) => `${v}%` },
    { label: "ROCE", key: "roce_percent", format: (v) => `${v}%` },
    { label: "P/E", key: "pe_ratio", format: (v) => `${v}x` },
    { label: "EPS", key: "eps", format: (v) => `₹${formatNumber(v)}` },
  ];

  const getLogoUrl = (logoData) => {
    const path = logoData?.data?.[0]?.path;
    if (!path) return null;
    return `${process.env.NEXT_PUBLIC_USER_BASE}admin/${path.replace("public/", "")}`;
  };

  return (
    <section className={`${styles.container} ${themeClass}`}>
      <h2 className={styles.title}>Peer Comparison</h2>

      <div className={styles.tableWrapper}>
        <table 
          className={`${styles.peerTable} ${companies.length === 2 ? styles.twoColumns : ""}`}
          style={companies.length > divisor ? { minWidth: `calc(120px + ${companies.length} * ((100% - 120px) / ${divisor}))` } : { width: '100%' }}
        >
          <thead>
            <tr>
              <th className={styles.metricHeader}>Metric</th>
              {companies.map((company, i) => (
                <th key={i} className={styles.companyHeader}>
                  <div className={styles.companyInfo}>
                    <span className={styles.companyName}>
                      {company.company_name?.data?.split("\n").map((line, idx) => (
                        <React.Fragment key={idx}>
                          {line}
                          <br />
                        </React.Fragment>
                      ))}
                    </span>
                    {company.company_logo?.status && company.company_logo?.data?.length > 0 ? (
                      <img
                        src={getLogoUrl(company.company_logo)}
                        alt={company.company_name?.data}
                        className={styles.companyLogoImg || "companyLogoImg"}
                        style={{ width: "28px", maxWidth: "28px", maxHeight: "28px",border:"1px solid #0000001A", borderRadius:"50%", objectFit: "contain", marginTop: "5px" }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <img
                        src="/logo-fallback.png"
                        alt={company.company_name?.data || "Company Logo"}
                        className={styles.companyLogoImg || "companyLogoImg"}
                        style={{ width: "28px", maxWidth: "28px", maxHeight: "28px", border:"1px solid #0000001A", borderRadius:"50%", objectFit: "contain", marginTop: "5px", backgroundColor: "#fff" }}
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metricsConfig.map((metric, idx) => (
              <tr key={idx}>
                <td className={styles.metricCell}>{metric.label}</td>
                {companies.map((company, i) => {
                  const field = company[metric.key];
                  const value = field?.status ? field.data : "-";
                  return (
                    <td key={i} className={styles.dataCell}>
                      {value !== "-" ? metric.format(value) : "-"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default PeerComparison;
