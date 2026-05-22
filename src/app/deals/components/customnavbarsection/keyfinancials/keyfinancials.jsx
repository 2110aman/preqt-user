"use client";
import React, { useState, useEffect, useRef } from "react";
import Barchart from "../charts/barchart/barchart";
import PurpleBarchart from "../charts/barchartpurple/barchartpurple";
import { Collapse, Tabs, Tab, Fade } from "react-bootstrap";
import "./keyfinancials.css";
import { ChevronDown, ChevronUp } from "lucide-react";
import DebtBarChart from "../charts/DebtBarchart";
import InterestCoverageBarchart from "../charts/InterestCoverageBarchart";
import CurrentRatioBarchart from "../charts/CurrentRatioBarchart";
import ROABarchart from "../charts/ROABarchart";
import ROEBarchart from "../charts/ROEBarchart";
import ROCEBarchart from "../charts/ROCEBarchart";
import { useDealStore } from "@/store/dealStore";
// import { useSearchParams } from "next/navigation";


const dummyPerfData = [
  // { isCategory: true, label: "Revenue & Growth" },
  // { label: "Revenue (₹Cr)", values: ["120.0", "120.0", { val: "120.0", color: "#16A34A" }] },
  // { label: "Growth (%)", values: ["+28.0%", "+31.0%", { val: "+33.0%", color: "#16A34A" }] },
  // { isCategory: true, label: "Earnings (Margins %)" },
  // { label: "EBITDA (Cr)", values: ["124.8", "124.8", { val: "9.43 (11.0%)", color: "#16A34A" }] },
  // { label: "PAT (Cr)", values: ["124.8", "124.8", { val: "4.61 (5.0%)", color: "#16A34A" }] },
  // { isCategory: true, label: "Valuation" },
  // { label: "P/E Ratio", values: ["21.6x", "21.6x", { val: "21.6x", color: "#16A34A" }] },
  // { isCategory: true, label: "Profitability Metrics" },
  // { label: "ROE (%)", values: ["-1.4%", "-1.4%", { val: "-1.4%", color: "#DC2626" }] },
  // { label: "ROE (%)", values: ["-1.4%", "-1.4%", { val: "-1.4%", color: "#DC2626" }] },
  // { label: "ROCE (%)", values: ["11.4%", "11.4%", { val: "11.4%", color: "#16A34A" }] },
  // { isCategory: true, label: "Leverage & Coverage" },
  // { label: "Debt-To-Equity Ratio", values: ["21.6x", "21.6x", { val: "21.6x", color: "#16A34A" }] },
  // { label: "Interest Coverage Ratio", values: ["21.6x", "21.6x", { val: "21.6x", color: "#16A34A" }] },
  // { isCategory: true, label: "Working Capital" },
  // { label: "Debtor Days", values: ["12.0", "21.0", { val: "34.0", color: "#16A34A" }] },
  // { label: "Creditor Days", values: ["54.0", "87.0", { val: "96.0", color: "#16A34A" }] },
  // { label: "Inventory Days", values: ["23.0", "32.0", { val: "45.0", color: "#16A34A" }] },
  // { isCategory: true, label: "Asset Efficiency" },
  // { label: "Long-Term Funds To Fixed Assets", values: ["1.2x", "1.2x", { val: "1.2x", color: "#16A34A" }] },
  // { isCategory: true, label: "Liquidity & Cost Structure" },
  // { label: "Current Ratio", values: ["1.2x", "1.2x", { val: "1.2x", color: "#16A34A" }] },
  // { label: "COGS (% Of Revenue)", values: ["+28.5%", "+31.0%", { val: "+33.0%", color: "#16A34A" }] }
];

const IncomeStatementTrends = ({ isPrivateDeal, data }) => {
  const defaultTrendsData = [
    {
      year: "2023",
      revenue: 120.0,
      growth: 28.0,
      ebitda: 12.6,
      ebitdaMargin: 10.5,
      pat: 5.8,
      patMargin: 4.8
    },
    {
      year: "2024",
      revenue: 157.0,
      growth: 31.0,
      ebitda: 17.0,
      ebitdaMargin: 10.8,
      pat: 7.7,
      patMargin: 4.9
    },
    {
      year: "2025",
      revenue: 209.0,
      growth: 33.0,
      ebitda: 23.0,
      ebitdaMargin: 11.0,
      pat: 10.5,
      patMargin: 5.0
    }
  ];

  const defaultObservations = [
    "Revenue has shown a consistent CAGR of ~32% over the last 3 years, indicating strong market demand.",
    "EBITDA margins remain stable around 11%, demonstrating effective cost management despite rapid scaling.",
    "PAT growth is mirroring revenue trends, signifying healthy bottom-line conversion."
  ];

  const rawApiData = data || [];
  const yearsToUse = rawApiData.length > 0
    ? [...new Set(rawApiData.map(item => item?.year?.toString()).filter(Boolean))].sort((a, b) => Number(a) - Number(b))
    : ["2023", "2024", "2025"];

  const trendsData = yearsToUse.map((yearStr) => {
    const apiItem = rawApiData.find(item => item?.year?.toString() === yearStr);
    const defaultItem = defaultTrendsData.find(d => d.year === yearStr) || {
      year: yearStr,
      revenue: null,
      growth: null,
      ebitda: null,
      ebitdaMargin: null,
      pat: null,
      patMargin: null
    };

    return {
      year: yearStr,
      revenue: apiItem?.revenue_in_cr ?? apiItem?.revenue ?? defaultItem.revenue,
      growth: apiItem?.topline_growth_percent ?? apiItem?.growth ?? defaultItem.growth,
      ebitda: apiItem?.ebitda_in_cr ?? apiItem?.ebitda ?? defaultItem.ebitda,
      ebitdaMargin: apiItem?.ebitda_percent ?? apiItem?.ebitdaMargin ?? defaultItem.ebitdaMargin,
      pat: apiItem?.pat_in_cr ?? apiItem?.pat ?? defaultItem.pat,
      patMargin: apiItem?.pat_percent ?? apiItem?.patMargin ?? defaultItem.patMargin,
    };
  });

  const apiObservations = rawApiData?.[0]?.observations || defaultObservations;
  const observationsList = Array.isArray(apiObservations) ? apiObservations : defaultObservations;

  const rows = [
    { label: "Revenue (₹ Cr)", key: "revenue", format: "currency" },
    { label: "Growth (%)", key: "growth", format: "percentage" },
    { label: "EBITDA (₹ Cr)", key: "ebitda", format: "currency" },
    { label: "EBITDA Margin (%)", key: "ebitdaMargin", format: "percentage" },
    { label: "PAT (₹ Cr)", key: "pat", format: "currency" },
    { label: "PAT Margin (%)", key: "patMargin", format: "percentage" }
  ];

  const tableWrapperRef = useRef(null);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(false);

  const checkScroll = () => {
    if (tableWrapperRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tableWrapperRef.current;
      const hasOverflow = scrollWidth > clientWidth;
      setShowLeftShadow(hasOverflow && scrollLeft > 5);
      setShowRightShadow(hasOverflow && scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();

    if (tableWrapperRef.current) {
      const { scrollWidth, clientWidth } = tableWrapperRef.current;
      if (scrollWidth > clientWidth) {
        setShowScrollHint(true);
      } else {
        setShowScrollHint(false);
      }
    }

    const element = tableWrapperRef.current;
    if (element) {
      if (typeof window !== "undefined" && "ResizeObserver" in window) {
        const resizeObserver = new ResizeObserver(() => {
          checkScroll();
        });
        resizeObserver.observe(element);
        return () => resizeObserver.disconnect();
      } else {
        window.addEventListener("resize", checkScroll);
        return () => window.removeEventListener("resize", checkScroll);
      }
    }
  }, [data]);

  const handleScroll = () => {
    checkScroll();
    if (showScrollHint) {
      setShowScrollHint(false);
    }
  };

  return (
    <div>
      <div className="income-statement-wrapper-relative">
        <div className={`scroll-shadow-right ${showRightShadow ? "visible" : ""}`} />
        
        {showScrollHint && (
          <div className="scroll-hint-badge" onClick={() => setShowScrollHint(false)}>
            <span className="scroll-hint-icon-wrapper">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8L22 12L18 16" />
                <path d="M6 8L2 12L6 16" />
                <path d="M2 12H22" />
              </svg>
            </span>
            <span>Swipe to view more</span>
          </div>
        )}

        <div 
          className="incomeStatementTableWrapper"
          ref={tableWrapperRef}
          onScroll={handleScroll}
        >
          <table className="incomeStatementTable">
            <thead>
              <tr>
                <th className="th-metric">Financial Metric</th>
                {trendsData.map((col, idx) => {
                  const isLatest = idx === trendsData.length - 1;
                  const displayYear = `FY ${col.year}`;
                  return (
                    <th
                      key={col.year}
                      className={isLatest ? "th-year-highlight" : "th-year-dim"}
                    >
                      {displayYear}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} className="tr-row">
                  <td className="td-label">{row.label}</td>
                  {trendsData.map((col, idx) => {
                    const isLatest = idx === trendsData.length - 1;
                    const value = col[row.key];

                    let displayVal = "-";
                    if (value !== null && value !== undefined) {
                      if (row.format === "percentage") {
                        displayVal = `${Number(value).toFixed(1)}%`;
                      } else if (row.format === "currency") {
                        if (row.key === "revenue") {
                          displayVal = Number(value) % 1 === 0
                            ? Number(value).toFixed(0)
                            : Number(value).toFixed(1);
                        } else {
                          displayVal = Number(value).toFixed(1);
                        }
                      } else {
                        displayVal = value.toString();
                      }
                    }

                    return (
                      <td
                        key={col.year}
                        className={isLatest ? "td-value-highlight" : "td-value-dim"}
                      >
                        {displayVal}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="observations-container">
        <h4 className="observations-title">OBSERVATIONS & INSIGHTS</h4>
        <ul className="observations-list">
          {observationsList.map((bullet, idx) => (
            <li key={idx}>{bullet}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const BalanceSheetSection = ({ isPrivateDeal, data }) => {
  const balanceSheetRows = [
    {
      label: "EQUITY & LIABILITIES",
      type: "category-header",
      tooltip: "Total of Net Worth and Total Liabilities. Represents what the company owes to owners and third parties.",
      key: "total_equity_and_liabilities",
      values: { "2023": 255, "2024": 330, "2025": 420 }
    },
    {
      label: "Net Worth",
      type: "sub-header",
      tooltip: "The total equity/book value of the company (Share Capital + Reserves & Surplus).",
      key: "net_worth",
      values: { "2023": 110, "2024": 140, "2025": 180 }
    },
    {
      label: "Share Capital",
      type: "indented",
      tooltip: "The portion of equity that has been raised through issuing shares.",
      key: "share_capital",
      values: { "2023": 15, "2024": 20, "2025": 25 }
    },
    {
      label: "Reserves & Surplus",
      type: "indented",
      tooltip: "Accumulated profits and capital gains retained in the business rather than distributed.",
      key: "reserves_and_surplus",
      values: { "2023": 95, "2024": 120, "2025": 155 }
    },
    {
      label: "Total Liabilities",
      type: "sub-header",
      tooltip: "Total debt and other obligations owed to external parties.",
      key: "total_liabilities",
      values: { "2023": 145, "2024": 190, "2025": 240 }
    },
    {
      label: "Current Liabilities",
      type: "indented",
      isBold: true,
      tooltip: "Short-term financial obligations that are due within one year.",
      key: "current_liabilities",
      values: { "2023": 145, "2024": 190, "2025": 240 }
    },
    {
      label: "Borrowings",
      type: "indented",
      tooltip: "Short-term interest-bearing loans and credit lines.",
      key: "current_borrowings",
      values: { "2023": 42, "2024": 55, "2025": 70 }
    },
    {
      label: "Trade Payables",
      type: "indented",
      tooltip: "Amount owed to suppliers for goods or services received on credit.",
      key: "trade_payables",
      values: { "2023": 30, "2024": 40, "2025": 50 }
    },
    {
      label: "Other Current Liabilities",
      type: "indented",
      tooltip: "Miscellaneous short-term debts not classified under borrowings or payables.",
      key: "other_current_liabilities",
      values: { "2023": 30, "2024": 40, "2025": 50 }
    },
    {
      label: "Non-Current Liabilities",
      type: "indented",
      isBold: true,
      tooltip: "Long-term financial obligations that are due after one year.",
      key: "non_current_liabilities",
      values: { "2023": 43, "2024": 55, "2025": 70 }
    },
    {
      label: "Borrowings",
      type: "indented",
      tooltip: "Long-term loans and bonds.",
      key: "non_current_borrowings",
      values: { "2023": 25, "2024": 30, "2025": 40 }
    },
    {
      label: "Other Non-Current Liabilities",
      type: "indented",
      tooltip: "Miscellaneous long-term obligations.",
      key: "other_non_current_liabilities",
      values: { "2023": 18, "2024": 25, "2025": 30 }
    },
    {
      label: "ASSETS",
      type: "category-header",
      tooltip: "Total economic resources owned by the company (Current + Non-Current Assets).",
      key: "total_assets",
      values: { "2023": 255, "2024": 330, "2025": 420 }
    },
    {
      label: "Current Assets",
      type: "sub-header",
      tooltip: "Resources that are expected to be converted to cash or consumed within one year.",
      key: "current_assets",
      values: { "2023": 110, "2024": 140, "2025": 180 }
    },
    {
      label: "Trade Receivables",
      type: "indented",
      tooltip: "Money owed to the company by customers for goods/services delivered.",
      key: "trade_receivables",
      values: { "2023": 95, "2024": 120, "2025": 155 }
    },
    {
      label: "Inventory",
      type: "indented",
      tooltip: "Value of raw materials, work-in-progress, and finished goods ready for sale.",
      key: "inventory",
      values: { "2023": 15, "2024": 20, "2025": 25 }
    },
    {
      label: "Cash & Cash Equivalents",
      type: "indented",
      tooltip: "Highly liquid assets including physical currency and bank balances.",
      key: "cash_and_equivalents",
      values: { "2023": 95, "2024": 120, "2025": 155 }
    },
    {
      label: "Other Current Assets",
      type: "indented",
      tooltip: "Miscellaneous short-term assets not categorized above.",
      key: "other_current_assets",
      values: { "2023": 95, "2024": 120, "2025": 155 }
    },
    {
      label: "Non-Current Assets",
      type: "sub-header",
      tooltip: "Long-term resources such as property, plant, and equipment.",
      key: "non_current_assets",
      values: { "2023": 110, "2024": 140, "2025": 180 }
    },
    {
      label: "Fixed Assets",
      type: "indented",
      tooltip: "Tangible physical assets (PP&E) used in operating the business.",
      key: "fixed_assets",
      values: { "2023": 15, "2024": 20, "2025": 25 }
    },
    {
      label: "Other Non-Current Assets",
      type: "indented",
      tooltip: "Long-term investments and intangible assets.",
      key: "other_non_current_assets",
      values: { "2023": 15, "2024": 20, "2025": 25 }
    }
  ];

  const defaultObservations = [
    "Revenue has shown a consistent CAGR of ~32% over the last 3 years, indicating strong market demand.",
    "EBITDA margins remain stable around 11%, demonstrating effective cost management despite rapid scaling.",
    "PAT growth is mirroring revenue trends, signifying healthy bottom-line conversion."
  ];

  const rawApiData = data || [];
  const yearsToUse = rawApiData.length > 0
    ? [...new Set(rawApiData.map(item => item?.year?.toString()).filter(Boolean))].sort((a, b) => Number(a) - Number(b))
    : ["2023", "2024", "2025"];

  const trendsData = yearsToUse.map((yearStr) => {
    const apiItem = rawApiData.find(item => item?.year?.toString() === yearStr);
    return {
      year: yearStr,
      apiItem
    };
  });

  const apiObservations = rawApiData?.[0]?.observations || defaultObservations;
  const observationsList = Array.isArray(apiObservations) ? apiObservations : defaultObservations;

  const tableWrapperRef = useRef(null);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(false);

  const checkScroll = () => {
    if (tableWrapperRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tableWrapperRef.current;
      const hasOverflow = scrollWidth > clientWidth;
      setShowLeftShadow(hasOverflow && scrollLeft > 5);
      setShowRightShadow(hasOverflow && scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();

    if (tableWrapperRef.current) {
      const { scrollWidth, clientWidth } = tableWrapperRef.current;
      if (scrollWidth > clientWidth) {
        setShowScrollHint(true);
      } else {
        setShowScrollHint(false);
      }
    }

    const element = tableWrapperRef.current;
    if (element) {
      if (typeof window !== "undefined" && "ResizeObserver" in window) {
        const resizeObserver = new ResizeObserver(() => {
          checkScroll();
        });
        resizeObserver.observe(element);
        return () => resizeObserver.disconnect();
      } else {
        window.addEventListener("resize", checkScroll);
        return () => window.removeEventListener("resize", checkScroll);
      }
    }
  }, [data]);

  const handleScroll = () => {
    checkScroll();
    if (showScrollHint) {
      setShowScrollHint(false);
    }
  };

  return (
    <div>
      <div className="balance-sheet-wrapper-relative">
        <div className={`scroll-shadow-right ${showRightShadow ? "visible" : ""}`} />
        
        {showScrollHint && (
          <div className="scroll-hint-badge" onClick={() => setShowScrollHint(false)}>
            <span className="scroll-hint-icon-wrapper">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8L22 12L18 16" />
                <path d="M6 8L2 12L6 16" />
                <path d="M2 12H22" />
              </svg>
            </span>
            <span>Swipe to view more</span>
          </div>
        )}

        <div 
          className="balanceSheetTableWrapper"
          ref={tableWrapperRef}
          onScroll={handleScroll}
        >
          <table className="balanceSheetTable">
            <thead>
              <tr>
                <th className="th-metric">Financial Metric</th>
                {trendsData.map((col, idx) => {
                  const isLatest = idx === trendsData.length - 1;
                  const displayYear = `FY ${col.year}`;
                  return (
                    <th
                      key={col.year}
                      className={isLatest ? "th-year-highlight" : "th-year-dim"}
                    >
                      {displayYear}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {balanceSheetRows.map((row, rowIdx) => {
                let trClass = "tr-row";
                if (row.type === "category-header") {
                  trClass = "tr-category-header";
                } else if (row.type === "sub-header") {
                  trClass = "tr-sub-header";
                } else if (row.type === "indented") {
                  trClass = row.isBold ? "tr-indented tr-indented-bold" : "tr-indented";
                }

                return (
                  <tr key={rowIdx} className={trClass}>
                    <td className="td-label">
                      {row.label}
                      <span className="bs-tooltip-container">
                        <img src="/toolTippublic.svg" alt="info" className="bs-tooltip-icon" />
                        <span className="bs-tooltip-text">{row.tooltip}</span>
                      </span>
                    </td>
                    {trendsData.map((col, idx) => {
                      const isLatest = idx === trendsData.length - 1;
                      const apiItem = col.apiItem;
                      const value = apiItem?.[row.key] ?? apiItem?.data?.[row.key] ?? row.values[col.year];

                      let displayVal = "-";
                      if (value !== null && value !== undefined) {
                        const numVal = Number(value);
                        const formattedNum = numVal % 1 === 0 ? numVal.toFixed(0) : numVal.toFixed(1);
                        displayVal = `₹ ${formattedNum} Cr`;
                      }

                      return (
                        <td
                          key={col.year}
                          className={isLatest ? "td-value-highlight" : "td-value-dim"}
                        >
                          {displayVal}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>


      <div className="observations-container">
        <h4 className="observations-title">OBSERVATIONS & INSIGHTS</h4>
        <ul className="observations-list">
          {observationsList.map((bullet, idx) => (
            <li key={idx}>{bullet}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const CashFlowSection = ({ isPrivateDeal, data }) => {
  const cashFlowRows = [
    {
      label: "CFO (₹ Cr)",
      description: "Cash generated from core business operations.",
      key: "cfo",
      values: { "2023": 45, "2024": 62, "2025": 88 }
    },
    {
      label: "CFI (₹ Cr)",
      description: "Cash used for investments and long-term assets.",
      key: "cfi",
      values: { "2023": -30, "2024": -45, "2025": -55 }
    },
    {
      label: "CFF (₹ Cr)",
      description: "Cash flow related to funding and borrowings.",
      key: "cff",
      values: { "2023": -10, "2024": 15, "2025": -20 }
    }
  ];

  const defaultObservations = [
    "Revenue has shown a consistent CAGR of ~32% over the last 3 years, indicating strong market demand.",
    "EBITDA margins remain stable around 11%, demonstrating effective cost management despite rapid scaling.",
    "PAT growth is mirroring revenue trends, signifying healthy bottom-line conversion."
  ];

  const rawApiData = data || [];
  const yearsToUse = rawApiData.length > 0
    ? [...new Set(rawApiData.map(item => item?.year?.toString()).filter(Boolean))].sort((a, b) => Number(a) - Number(b))
    : ["2023", "2024", "2025"];

  const trendsData = yearsToUse.map((yearStr) => {
    const apiItem = rawApiData.find(item => item?.year?.toString() === yearStr);
    return {
      year: yearStr,
      apiItem
    };
  });

  const apiObservations = rawApiData?.[0]?.observations || defaultObservations;
  const observationsList = Array.isArray(apiObservations) ? apiObservations : defaultObservations;

  const formatCashFlowValue = (val) => {
    if (val === null || val === undefined) return "-";
    const num = Number(val);
    const sign = num >= 0 ? "+" : ""; // Negative numbers already include "-"
    return `${sign}${num.toFixed(0)} Cr`;
  };

  const getCashFlowColorClass = (val) => {
    if (val === null || val === undefined) return "";
    return Number(val) >= 0 ? "cf-positive" : "cf-negative";
  };

  const tableWrapperRef = useRef(null);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(false);

  const checkScroll = () => {
    if (tableWrapperRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tableWrapperRef.current;
      const hasOverflow = scrollWidth > clientWidth;
      setShowLeftShadow(hasOverflow && scrollLeft > 5);
      setShowRightShadow(hasOverflow && scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();

    if (tableWrapperRef.current) {
      const { scrollWidth, clientWidth } = tableWrapperRef.current;
      if (scrollWidth > clientWidth) {
        setShowScrollHint(true);
      } else {
        setShowScrollHint(false);
      }
    }

    const element = tableWrapperRef.current;
    if (element) {
      if (typeof window !== "undefined" && "ResizeObserver" in window) {
        const resizeObserver = new ResizeObserver(() => {
          checkScroll();
        });
        resizeObserver.observe(element);
        return () => resizeObserver.disconnect();
      } else {
        window.addEventListener("resize", checkScroll);
        return () => window.removeEventListener("resize", checkScroll);
      }
    }
  }, [data]);

  const handleScroll = () => {
    checkScroll();
    if (showScrollHint) {
      setShowScrollHint(false);
    }
  };

  return (
    <div>
      <div className="cash-flow-wrapper-relative">
        <div className={`scroll-shadow-right ${showRightShadow ? "visible" : ""}`} />
        
        {showScrollHint && (
          <div className="scroll-hint-badge" onClick={() => setShowScrollHint(false)}>
            <span className="scroll-hint-icon-wrapper">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8L22 12L18 16" />
                <path d="M6 8L2 12L6 16" />
                <path d="M2 12H22" />
              </svg>
            </span>
            <span>Swipe to view more</span>
          </div>
        )}

        <div 
          className="cashFlowTableWrapper"
          ref={tableWrapperRef}
          onScroll={handleScroll}
        >
          <table className="cashFlowTable">
            <thead>
              <tr>
                <th className="th-metric">Financial Metric</th>
                {trendsData.map((col, idx) => {
                  const isLatest = idx === trendsData.length - 1;
                  const displayYear = `FY ${col.year}`;
                  return (
                    <th
                      key={col.year}
                      className={isLatest ? "th-year-highlight" : "th-year-dim"}
                    >
                      {displayYear}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {cashFlowRows.map((row, rowIdx) => {
                return (
                  <tr key={rowIdx} className="tr-row">
                    <td className="td-label">
                      <div className="cf-metric-title">{row.label}</div>
                      <div className="cf-metric-desc">{row.description}</div>
                    </td>
                    {trendsData.map((col, idx) => {
                      const isLatest = idx === trendsData.length - 1;
                      const apiItem = col.apiItem;
                      const value = apiItem?.[row.key] ?? apiItem?.data?.[row.key] ?? row.values[col.year];

                      const displayVal = formatCashFlowValue(value);
                      const colorClass = getCashFlowColorClass(value);

                      return (
                        <td
                          key={col.year}
                          className={`${isLatest ? "td-value-highlight" : "td-value-dim"} ${colorClass}`}
                        >
                          {displayVal}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="observations-container">
        <h4 className="observations-title">OBSERVATIONS & INSIGHTS</h4>
        <ul className="observations-list">
          {observationsList.map((bullet, idx) => (
            <li key={idx}>{bullet}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const WorkingCapitalSection = ({ isPrivateDeal, data }) => {
  const workingCapitalRows = [
    {
      label: "Debtor Days",
      description: "Average number of days taken to collect customer payments.",
      key: "debtor_days",
      values: { "2023": 42, "2024": 38, "2025": 34 }
    },
    {
      label: "Creditor Days",
      description: "Average time taken to pay suppliers and vendors.",
      key: "creditor_days",
      values: { "2023": 55, "2024": 60, "2025": 65 }
    },
    {
      label: "Inventory Days",
      description: "Average number of days inventory remains unsold.",
      key: "inventory_days",
      values: { "2023": 42, "2024": 30, "2025": 32 }
    },
    {
      label: "CCC (Cash Conversion Cycle)",
      description: "(Debtor Days + Inventory Days - Creditor Days)",
      key: "ccc",
      isCCC: true,
      values: { "2023": 15, "2024": 8, "2025": 1 }
    }
  ];

  const defaultObservations = [
    "Revenue has shown a consistent CAGR of ~32% over the last 3 years, indicating strong market demand.",
    "EBITDA margins remain stable around 11%, demonstrating effective cost management despite rapid scaling.",
    "PAT growth is mirroring revenue trends, signifying healthy bottom-line conversion."
  ];

  const rawApiData = data || [];
  const yearsToUse = rawApiData.length > 0
    ? [...new Set(rawApiData.map(item => item?.year?.toString()).filter(Boolean))].sort((a, b) => Number(a) - Number(b))
    : ["2023", "2024", "2025"];

  const trendsData = yearsToUse.map((yearStr) => {
    const apiItem = rawApiData.find(item => item?.year?.toString() === yearStr);
    return {
      year: yearStr,
      apiItem
    };
  });

  const apiObservations = rawApiData?.[0]?.observations || defaultObservations;
  const observationsList = Array.isArray(apiObservations) ? apiObservations : defaultObservations;

  const formatDaysValue = (val) => {
    if (val === null || val === undefined) return "-";
    const num = Number(val);
    return `${num.toFixed(0)} Days`;
  };

  const tableWrapperRef = useRef(null);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(false);

  const checkScroll = () => {
    if (tableWrapperRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tableWrapperRef.current;
      const hasOverflow = scrollWidth > clientWidth;
      setShowLeftShadow(hasOverflow && scrollLeft > 5);
      setShowRightShadow(hasOverflow && scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();

    if (tableWrapperRef.current) {
      const { scrollWidth, clientWidth } = tableWrapperRef.current;
      if (scrollWidth > clientWidth) {
        setShowScrollHint(true);
      } else {
        setShowScrollHint(false);
      }
    }

    const element = tableWrapperRef.current;
    if (element) {
      if (typeof window !== "undefined" && "ResizeObserver" in window) {
        const resizeObserver = new ResizeObserver(() => {
          checkScroll();
        });
        resizeObserver.observe(element);
        return () => resizeObserver.disconnect();
      } else {
        window.addEventListener("resize", checkScroll);
        return () => window.removeEventListener("resize", checkScroll);
      }
    }
  }, [data]);

  const handleScroll = () => {
    checkScroll();
    if (showScrollHint) {
      setShowScrollHint(false);
    }
  };

  return (
    <div>
      <div className="working-capital-wrapper-relative">
        <div className={`scroll-shadow-right ${showRightShadow ? "visible" : ""}`} />
        
        {showScrollHint && (
          <div className="scroll-hint-badge" onClick={() => setShowScrollHint(false)}>
            <span className="scroll-hint-icon-wrapper">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8L22 12L18 16" />
                <path d="M6 8L2 12L6 16" />
                <path d="M2 12H22" />
              </svg>
            </span>
            <span>Swipe to view more</span>
          </div>
        )}

        <div 
          className="workingCapitalTableWrapper"
          ref={tableWrapperRef}
          onScroll={handleScroll}
        >
          <table className="workingCapitalTable">
            <thead>
              <tr>
                <th className="th-metric">Efficiency Metric</th>
                {trendsData.map((col, idx) => {
                  const isLatest = idx === trendsData.length - 1;
                  const displayYear = `FY ${col.year}`;
                  return (
                    <th
                      key={col.year}
                      className={isLatest ? "th-year-highlight" : "th-year-dim"}
                    >
                      {displayYear}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {workingCapitalRows.map((row, rowIdx) => {
                const trClass = row.isCCC ? "tr-row tr-ccc" : "tr-row";
                return (
                  <tr key={rowIdx} className={trClass}>
                    <td className="td-label">
                      <div className="wc-metric-title">{row.label}</div>
                      <div className="wc-metric-desc">{row.description}</div>
                    </td>
                    {trendsData.map((col, idx) => {
                      const isLatest = idx === trendsData.length - 1;
                      const apiItem = col.apiItem;

                      let value;
                      if (row.isCCC) {
                        const debtorVal = apiItem?.debtor_days ?? apiItem?.data?.debtor_days;
                        const creditorVal = apiItem?.creditor_days ?? apiItem?.data?.creditor_days;
                        const inventoryVal = apiItem?.inventory_days ?? apiItem?.data?.inventory_days;

                        if (debtorVal !== undefined && creditorVal !== undefined && inventoryVal !== undefined) {
                          value = Number(debtorVal) + Number(inventoryVal) - Number(creditorVal);
                        } else {
                          value = row.values[col.year];
                        }
                      } else {
                        value = apiItem?.[row.key] ?? apiItem?.data?.[row.key] ?? row.values[col.year];
                      }

                      const displayVal = formatDaysValue(value);

                      return (
                        <td
                          key={col.year}
                          className={isLatest ? "td-value-highlight" : "td-value-dim"}
                        >
                          {displayVal}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="observations-container">
        <h4 className="observations-title">OBSERVATIONS & INSIGHTS</h4>
        <ul className="observations-list">
          {observationsList.map((bullet, idx) => (
            <li key={idx}>{bullet}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const Keyfinancials = ({ isPrivateDeal = false }) => {


  const dealDetails = useDealStore((state) => state.dealDetails);

  const transformFinancialData = (apiData) => {
    try {
      const perfArray = apiData?.financial_performance?.data;
      if (!Array.isArray(perfArray)) {
        console.warn("KeyFinancials: financial_performance.data is not an array");
        return [];
      }

      return perfArray
        .filter((yearObj) => yearObj?.status && yearObj?.data)
        .map((yearObj) => {
          const year = yearObj.value || "N/A";
          const yearData = yearObj.data || {};

          return {
            year: year.toString(),


            revenue: {
              status: yearData.revenue_in_cr?.status || false,
              value: yearData.revenue_in_cr.data
            },

            // growth
            growth: {
              status: yearData.topline_growth_percent?.status || false,
              value: yearData.topline_growth_percent.data
            },

            // earnings
            ebitda: {
              status: yearData.earnings?.ebitda_in_cr?.status || false,
              value: yearData.earnings?.ebitda_in_cr?.data || 0,
            },
            pat: {
              status: yearData.earnings?.pat_in_cr?.status || false,
              value: yearData.earnings?.pat_in_cr?.data || 0,
            },

            // valuation
            peratio: {
              status: yearData.valuation?.pe_ratio?.status || false,
              value: yearData.valuation?.pe_ratio?.data || 0,
            },

            // returns on capital
            roa: {
              status: yearData.returns_on_capital?.roa_percent?.status || false,
              value: yearData.returns_on_capital?.roa_percent?.data || 0,
            },
            roe: {
              status: yearData.returns_on_capital?.roe_percent?.status || false,
              value: yearData.returns_on_capital?.roe_percent?.data || 0,
            },
            roce: {
              status: yearData.returns_on_capital?.roce_percent?.status || false,
              value: yearData.returns_on_capital?.roce_percent?.data || 0,
            },

            // leverage and coverage
            debttoequity: {
              status:
                yearData.leverage_and_coverage?.debt_to_equity?.status || false,
              value:
                yearData.leverage_and_coverage?.debt_to_equity?.data || 0,
            },
            interestcoverage: {
              status:
                yearData.leverage_and_coverage?.interest_coverage_ratio?.status ||
                false,
              value:
                yearData.leverage_and_coverage?.interest_coverage_ratio?.data ||
                0,
            },

            // working capital
            debtordays: {
              status: yearData.working_capital?.debtor_days?.status || false,
              value: yearData.working_capital?.debtor_days?.data || 0,
            },
            creditordays: {
              status: yearData.working_capital?.creditor_days?.status || false,
              value: yearData.working_capital?.creditor_days?.data || 0,
            },
            inventorydays: {
              status: yearData.working_capital?.inventory_days?.status || false,
              value: yearData.working_capital?.inventory_days?.data || 0,
            },

            // asset efficiency
            longtermfundstofixed: {
              status:
                yearData.asset_efficiency?.lt_funds_to_fixed_assets?.status ||
                false,
              value:
                yearData.asset_efficiency?.lt_funds_to_fixed_assets?.data || 0,
            },

            // liquidity
            currentratio: {
              status: yearData.liquidity?.current_ratio?.status || false,
              value: yearData.liquidity?.current_ratio?.data || 0,
            },

            // cost structure
            cogs: {
              status:
                yearData.cost_structure?.cogs_percent_of_revenue?.status || false,
              value:
                yearData.cost_structure?.cogs_percent_of_revenue?.data || 0,
            },
          };
        });
    } catch (error) {
      console.error("KeyFinancials: Error transforming financial data", error);
      return [];
    }
  };



  const getFinancialData = () => {
    try {
      if (isPrivateDeal) {
        return dealDetails?.data?.financial_highlights?.financial_performance
          ? transformFinancialData(dealDetails.data.financial_highlights)
          : [];
      } else {
        return dealDetails?.data?.financial_highlights?.financial_performance
          ? transformFinancialData(dealDetails.data.financial_highlights)
          : [];
      }
    } catch (error) {
      console.error('KeyFinancials: Error getting financial data', error);
      return [];
    }
  };

  const financialData = getFinancialData();

  console.log("dealDetails?.data?.key_financials", dealDetails?.data?.financial_highlights);
  console.log("financialData", financialData);

  const data = financialData.length > 0 ? financialData : (isPrivateDeal ? [] : []);
  console.log("data", data);

  const showData = dealDetails?.data?.financial_highlights?.financial_performance?.data?.data?.revenue_in_cr?.status;
  console.log('Showing the data for Revenue', showData);

  const [activeTab, setActiveTab] = useState("Debt to Equity (x)");
  const [activeStyle, setActiveStyle] = useState({ left: 0, width: 0 });
  const tabsContainerRef = useRef(null);

  useEffect(() => {
    const updateActiveIndicator = () => {
      if (tabsContainerRef.current) {
        const activeTabElement = tabsContainerRef.current.querySelector(".customTab.active");
        if (activeTabElement) {
          setActiveStyle({
            left: activeTabElement.offsetLeft,
            width: activeTabElement.offsetWidth,
          });
        }
      }
    };

    updateActiveIndicator();
    const timer = setTimeout(updateActiveIndicator, 50);

    window.addEventListener("resize", updateActiveIndicator);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateActiveIndicator);
    };
  }, [activeTab]);

  const tabs = [
    { key: "Debt to Equity (x)", label: "Debt to Equity (x)" },
    { key: "Interest Coverage Ratio (x)", label: "Interest Coverage Ratio (x)" },
    { key: "Current Ratio (x)", label: "Current Ratio (x)" },
    { key: "ROA (%)", label: "ROA (%)" },
    { key: "ROE (%)", label: "ROE (%)" },
    { key: "ROCE (%)", label: "ROCE (%)" },
  ];

  const tabDescriptions = {
    "Debt to Equity (x)": "Measures the company’s leverage relative to shareholder equity.",
    "Interest Coverage Ratio (x)": "Shows the company’s ability to meet interest obligations.",
    "Current Ratio (x)": "Evaluates short-term liquidity and financial stability.",
    "ROA (%)": "Measures profitability generated from total assets.",
    "ROE (%)": "Measures how efficiently the company generates profits from shareholder equity.",
    "ROCE (%)": "Evaluates efficiency in utilizing capital employed.",
  };

  const formattedData = data.map((item) => ({
    ...item,
    debttoequity: {
      ...item.debttoequity,
      value:
        item?.debttoequity?.value != null && !Number.isNaN(Number(item.debttoequity.value))
          ? Number(item.debttoequity.value).toFixed(1)
          : item?.debttoequity?.value,
    },
    currentratio: {
      ...item.currentratio,
      value:
        item?.currentratio?.value != null && !Number.isNaN(Number(item.currentratio.value))
          ? Number(item.currentratio.value).toFixed(1)
          : item?.currentratio?.value,
    },
    cogs: {
      ...item.cogs,
      value:
        item?.cogs?.value != null && !Number.isNaN(Number(item.cogs.value))
          ? Number(item.cogs.value).toFixed(1)
          : item?.cogs?.value,
    },
  }));

  // Track open/close state for each main section
  const [openStates, setOpenStates] = useState({
    financialTrends: true,
    balanceSheet: true,
    cashFlow: true,
    workingCapital: true,
    financialRatios: true,
    documents: true,
  });

  // Track open/close state for nested yearly accordions
  const [nestedOpen, setNestedOpen] = useState(() => {
    const sorted = [...data].sort((a, b) => b.year - a.year);

    const initial = {};
    sorted.forEach((item, index) => {
      initial[item.year] = index === 0; // first year open, rest closed
    });
    return initial;
  });

  const toggleSection = (section) => {
    setOpenStates((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleYear = (year) => {
    setNestedOpen((prev) => ({
      ...prev,
      [year]: !prev[year],
    }));
  };
  return (
    // <div className="key-financials-container">
    <div
      className={`key-financials-container ${isPrivateDeal ? "private-deal" : ""
        }`}
    >
      {/* Financial Trends */}
      {dealDetails?.data?.financial_highlights?.financial_trends?.status && (
        <div className="section">
          <div
            className="section-header"
            onClick={() => toggleSection("financialTrends")}
          >
            <h3>Income Statement</h3>
            <span>
              {openStates.financialTrends ? <ChevronUp /> : <ChevronDown />}
            </span>
          </div>
          <Collapse in={openStates.financialTrends}>
            <div className="section-body">
              <p className="section-sub-header">
                Revenue growth with EBITDA and PAT margins
              </p>
              <Barchart
                isPrivateDeal={isPrivateDeal}
                data={dealDetails?.data?.financial_highlights?.financial_trends?.data || []}
              />
              <IncomeStatementTrends
                isPrivateDeal={isPrivateDeal}
                data={dealDetails?.data?.financial_highlights?.financial_trends?.data || []}
              />
            </div>
          </Collapse>
        </div>
      )}

      {/* Balance Sheet */}
      {(dealDetails?.data?.financial_highlights?.balance_sheet?.status || dealDetails?.data?.financial_highlights?.financial_performance?.status) && (
        <div className="section">
          <div
            className="section-header"
            onClick={() => toggleSection("balanceSheet")}
          >
            <h3>Balance Sheet</h3>
            <span>
              {openStates.balanceSheet ? <ChevronUp /> : <ChevronDown />}
            </span>
          </div>

          <Collapse in={openStates.balanceSheet}>
            <div className="section-body financial-performance-ui">
              <BalanceSheetSection
                isPrivateDeal={isPrivateDeal}
                data={dealDetails?.data?.financial_highlights?.balance_sheet?.data || []}
              />
            </div>
          </Collapse>
        </div>
      )}

      {/* Cash Flow */}
      {(dealDetails?.data?.financial_highlights?.cash_flow?.status || dealDetails?.data?.financial_highlights?.financial_performance?.status || dealDetails?.data?.financial_highlights?.balance_sheet?.status) && (
        <div className="section">
          <div
            className="section-header"
            onClick={() => toggleSection("cashFlow")}
          >
            <h3>Cash Flow</h3>
            <span>
              {openStates.cashFlow ? <ChevronUp /> : <ChevronDown />}
            </span>
          </div>

          <Collapse in={openStates.cashFlow}>
            <div className="section-body financial-performance-ui">
              <CashFlowSection
                isPrivateDeal={isPrivateDeal}
                data={dealDetails?.data?.financial_highlights?.cash_flow?.data || []}
              />
            </div>
          </Collapse>
        </div>
      )}

      {/* Working Capital */}
      {(dealDetails?.data?.financial_highlights?.working_capital?.status || dealDetails?.data?.financial_highlights?.financial_performance?.status || dealDetails?.data?.financial_highlights?.balance_sheet?.status) && (
        <div className="section">
          <div
            className="section-header"
            onClick={() => toggleSection("workingCapital")}
          >
            <h3>Working Capital</h3>
            <span>
              {openStates.workingCapital ? <ChevronUp /> : <ChevronDown />}
            </span>
          </div>

          <Collapse in={openStates.workingCapital}>
            <div className="section-body financial-performance-ui">
              <WorkingCapitalSection
                isPrivateDeal={isPrivateDeal}
                data={dealDetails?.data?.financial_highlights?.working_capital?.data || []}
              />
            </div>
          </Collapse>
        </div>
      )}

      {/* Financial Ratios */}
      {dealDetails?.data?.financial_highlights?.financial_ratio?.status && (
        <div className="section">
          <div
            className="section-header"
            onClick={() => toggleSection("financialRatios")}
          >
            <h3>Financial Ratios</h3>
            <span>
              {openStates.financialRatios ? <ChevronUp /> : <ChevronDown />}
            </span>
          </div>
          <Collapse in={openStates.financialRatios}>
            <div className="section-body">
              <div>
                {/* Tabs Header */}
                <div className="customTabsWrapper">
                  <div className="customTabs" ref={tabsContainerRef} style={{ position: "relative" }}>
                    <div
                      className="customTabIndicator"
                      style={{
                        left: `${activeStyle.left}px`,
                        width: `${activeStyle.width}px`,
                      }}
                    />
                    {tabs.map((tab) => (
                      <button
                        key={tab.key}
                        className={`customTab ${activeTab === tab.key ? "active" : ""
                          }`}
                        onClick={() => setActiveTab(tab.key)}
                        style={{ position: "relative", zIndex: 1 }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Description */}
                <div className="ratioTabDescription">
                  {tabDescriptions[activeTab]}
                </div>

                {/* Tabs Content */}
                <div className="tabContent">
                  {activeTab === "ROCE (%)" && (
                    <ROCEBarchart
                      isPrivate={isPrivateDeal}
                      data={dealDetails?.data?.financial_highlights?.financial_ratio?.data || []}
                    />
                  )}
                  {activeTab === "ROE (%)" && (
                    <ROEBarchart
                      isPrivate={isPrivateDeal}
                      data={dealDetails?.data?.financial_highlights?.financial_ratio?.data || []}
                    />
                  )}
                  {activeTab === "ROA (%)" && (
                    <ROABarchart
                      isPrivate={isPrivateDeal}
                      data={dealDetails?.data?.financial_highlights?.financial_ratio?.data || []}
                    />
                  )}
                  {activeTab === "Current Ratio (x)" && (
                    <CurrentRatioBarchart
                      isPrivate={isPrivateDeal}
                      data={dealDetails?.data?.financial_highlights?.financial_ratio?.data || []}
                    />
                  )}
                  {activeTab === "Interest Coverage Ratio (x)" && (
                    <InterestCoverageBarchart
                      isPrivate={isPrivateDeal}
                      data={dealDetails?.data?.financial_highlights?.financial_ratio?.data || []}
                    />
                  )}
                  {activeTab === "Debt to Equity (x)" && (
                    <DebtBarChart
                      isPrivate={isPrivateDeal}
                      data={dealDetails?.data?.financial_highlights?.financial_ratio?.data || []}
                    />
                  )}
                </div>
              </div>
            </div>
          </Collapse>
        </div>
      )}


      {/* Documents */}
      {/* <div className="section">
        <div
          className="section-header"
          onClick={() => toggleSection("documents")}
        >
          <h3>Documents</h3>
          <span>{openStates.documents ? <ChevronUp /> : <ChevronDown />}</span>
        </div>
        <Collapse in={openStates.documents}>
          <div className="section-body">
           
          </div>
        </Collapse>
      </div> */}
    </div>
  );
};

export default Keyfinancials;
