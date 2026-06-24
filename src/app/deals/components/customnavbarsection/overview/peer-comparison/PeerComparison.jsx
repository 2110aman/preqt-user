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

  const companies = (peerComparison?.data || []).filter(
    (company) => company?.company_name?.status === true
  );

  if (!peerComparison?.status || companies.length === 0) {
    return null;
  }
  const themeClass = isPrivateDeal ? styles.dark : styles.light;

  const formatNumber = (value) => {
    if (value === null || value === undefined || isNaN(Number(value))) return value ?? "-";
    return Number(value).toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };

  const getColumnDivisor = () => {
    if (windowWidth < 550) return 1.5; // Show 1.5 company columns (1 full + 1 half)
    if (windowWidth < 786) return 2.5; // Show 2.5 company columns (2 full + 1 half)
    if (windowWidth < 1200) return 3.5; // Show 3.5 company columns (3 full + 1 half)
    return 4.5; // Show 4.5 company columns (4 full + 1 half)
  };

  const divisor = getColumnDivisor();
  const metricWidth = (companies.length === 2 && windowWidth >= 550) ? 200 : 120;

  const metricsConfig = [
    { label: "Revenue", key: "revenue_in_cr", format: (v) => `₹${formatNumber(v)} Cr` },
    { label: "EBITDA Margin", key: "ebitda_margin_percent", format: (v) => `${v}%` },
    { label: "PAT", key: "pat", format: (v) => `₹${formatNumber(v)} Cr` },
    
    { label: "ROE", key: "roe_percent", format: (v) => `${v}%` },
    { label: "ROCE", key: "roce_percent", format: (v) => `${v}%` },
    { label: "P/E", key: "pe_ratio", format: (v) => `${v}x` },
    { label: "EPS", key: "eps", format: (v) => `₹${formatNumber(v)}` },
  ];

  const activeMetrics = metricsConfig.filter((metric) =>
    companies.some((company) => company[metric.key]?.status === true)
  );

  const getLogoUrl = (logoData) => {
    let data = logoData?.data;
    if (!data) return null;

    const parseData = (val) => {
      if (typeof val === 'string') {
        try {
          return JSON.parse(val);
        } catch (e) {
          return null;
        }
      }
      return val;
    };

    let attempts = 0;
    while (typeof data === 'string' && attempts < 5) {
      const parsed = parseData(data);
      if (parsed === null) break;
      data = parsed;
      attempts++;
    }

    let path = null;
    if (Array.isArray(data)) {
      if (data.length > 0) {
        let firstElement = data[0];
        attempts = 0;
        while (typeof firstElement === 'string' && attempts < 5) {
          const parsed = parseData(firstElement);
          if (parsed === null) break;
          firstElement = parsed;
          attempts++;
        }
        
        if (Array.isArray(firstElement)) {
          path = firstElement[0]?.path;
        } else if (firstElement && typeof firstElement === 'object') {
          path = firstElement.path;
        }
      }
    } else if (data && typeof data === 'object') {
      path = data.path;
    }

    if (!path) return null;
    return `${process.env.NEXT_PUBLIC_USER_BASE}admin/${path.replace("public/", "")}`;
  };

  return (
    <section className={`${styles.container} ${themeClass}`}>
      <h2 className={styles.title}>Peer Comparison</h2>

      <div className={styles.tableWrapper}>
        <table 
          className={`${styles.peerTable} ${companies.length === 2 ? styles.twoColumns : ""}`}
          style={companies.length > divisor ? { minWidth: `calc(${metricWidth}px + ${companies.length} * ((100% - ${metricWidth}px) / ${divisor}))` } : { width: '100%' }}
        >
          <thead>
            <tr>
              <th className={styles.metricHeader}>Metric</th>
              {companies.map((company, i) => {
                const logoUrl = company.company_logo?.status ? getLogoUrl(company.company_logo) : null;
                return (
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
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt={company.company_name?.data}
                          className={styles.companyLogoImg || "companyLogoImg"}
                          style={{ width: "28px", maxWidth: "28px", maxHeight: "28px", border: "1px solid #0000001A", borderRadius: "50%", objectFit: "contain", flexShrink: "0" }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <img
                          src="/logo-fallback.png"
                          alt={company.company_name?.data || "Company Logo"}
                          className={styles.companyLogoImg || "companyLogoImg"}
                          style={{ width: "28px", maxWidth: "28px", maxHeight: "28px", border: "1px solid #0000001A", borderRadius: "50%", objectFit: "contain", marginTop: "5px", backgroundColor: "#fff", flexShrink: "0" }}
                        />
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {activeMetrics.map((metric, idx) => (
              <tr key={idx}>
                <td className={styles.metricCell}>{metric.label}</td>
                {companies.map((company, i) => {
                  const field = company[metric.key];
                  const value = (field?.status && field.data !== null && field.data !== undefined && field.data !== "") ? field.data : "-";
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
