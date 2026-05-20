"use client";
import React, { useState } from "react";
import Barchart from "../charts/barchart/barchart";
import PurpleBarchart from "../charts/barchartpurple/barchartpurple";
import { Collapse, Tabs, Tab, Fade } from "react-bootstrap";
import "./keyfinancials.css";
import { ChevronDown, ChevronUp } from "lucide-react";
import DebtBarChart from "../charts/DebtBarchart";
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

  const [activeTab, setActiveTab] = useState("ROE");

  const tabs = [
    { key: "ROE", label: "Return on Equity (ROE)" },
    { key: "DEBT", label: "Debt to Equity" },
  ];

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
    financialPerformance: true,
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
            <h3>Financial Trends</h3>
            <span>
              {openStates.financialTrends ? <ChevronUp /> : <ChevronDown />}
            </span>
          </div>
          <Collapse in={openStates.financialTrends}>
            <div className="section-body">
              <h2 style={{ marginBottom: "20px" }}>
                Revenue growth with EBITDA and PAT margins
              </h2>
              <Barchart
                isPrivateDeal={isPrivateDeal}
                data={dealDetails?.data?.financial_highlights?.financial_trends?.data || []}
              />
            </div>
          </Collapse>
        </div>
      )}

      {/* Financial Performance */}
      {dealDetails?.data?.financial_highlights?.financial_performance?.status && (
        <div className="section">
          <div
            className="section-header"
            onClick={() => toggleSection("financialPerformance")}
          >
            <h3>Financial Performance</h3>
            <span>
              {openStates.financialPerformance ? <ChevronUp /> : <ChevronDown />}
            </span>
          </div>

          <Collapse in={openStates.financialPerformance}>
            <div className="section-body financial-performance-ui">
              <div className="financialTableWrapper">
                <table className="financialTable">
                  <thead>
                    <tr>
                      <th className="th-metric">METRIC</th>
                      {[...formattedData].sort((a, b) => Number(a.year) - Number(b.year)).map((d, i, arr) => (
                        <th key={i} className={i === arr.length - 1 ? "th-current" : "th-year"}>
                          FY&apos;{Math.floor(Number(d.year)).toString().slice(-2)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { isCategory: true, label: "Revenue & Growth" },
                      { label: "Revenue (₹Cr)", key: "revenue" },
                      { label: "Growth (%)", key: "growth" },
                      { isCategory: true, label: "Earnings (Margins %)" },
                      { label: "EBITDA (Cr %)", key: "ebitda" },
                      { label: "PAT (Cr %)", key: "pat" },
                      { isCategory: true, label: "Valuation" },
                      { label: "P/E Ratio", key: "peratio" },
                      { isCategory: true, label: "Profitability Metrics" },
                      { label: "ROE (%)", key: "roe" },
                      { label: "ROCE (%)", key: "roce" },
                      { label: "ROA (%)", key: "roa" },
                      { isCategory: true, label: "Leverage & Coverage" },
                      { label: "Debt-To-Equity Ratio (x)", key: "debttoequity" },
                      { label: "Interest Coverage Ratio (x)", key: "interestcoverage" },
                      { isCategory: true, label: "Working Capital" },
                      { label: "Debtor Days", key: "debtordays" },
                      { label: "Creditor Days", key: "creditordays" },
                      { label: "Inventory Days", key: "inventorydays" },
                      { isCategory: true, label: "Asset Efficiency" },
                      { label: "Long-Term Funds To Fixed Assets", key: "longtermfundstofixed" },
                      { isCategory: true, label: "Liquidity & Cost Structure" },
                      { label: "Current Ratio (x)", key: "currentratio" },
                      { label: "COGS (% Of Revenue)", key: "cogs" }
                    ].map((row, idx) => {
                      if (row.isCategory) {
                        return (
                          <tr key={idx} className="tr-category">
                            <td className="td-category-label">{row.label}</td>
                            <td colSpan={formattedData.length}></td>
                          </tr>
                        );
                      }

                      const sortedFilteredData = [...formattedData].sort((a, b) => Number(a.year) - Number(b.year));

                      return (
                        <tr key={idx} className="tr-data">
                          <td className="td-label">{row.label}</td>
                          {sortedFilteredData.map((yearData, colIdx) => {
                            const field = yearData[row.key];
                            const rawValue = field?.status ? field.value : "-";
                            const isLastCol = colIdx === sortedFilteredData.length - 1;

                            // Formatter
                            let displayVal = rawValue;
                            let cellColor = "inherit";

                            if (rawValue !== "-" && rawValue !== null && rawValue !== undefined) {
                              const numString = Number(rawValue).toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
                              if (["growth"].includes(row.key)) displayVal = `${Number(rawValue) > 0 ? '+' : ''}${numString}%`;
                              else if (["roe", "roce", "roa", "cogs", "ebitda", "pat"].includes(row.key)) displayVal = `${numString}%`;
                              else if (["peratio", "debttoequity", "interestcoverage", "longtermfundstofixed", "currentratio"].includes(row.key)) displayVal = `${numString}x`;
                              else displayVal = numString;

                              if (isLastCol) {
                                if (["growth", "roe", "roce", "roa", "ebitda", "pat"].includes(row.key)) {
                                  cellColor = Number(rawValue) < 0 ? "#DC2626" : "#16A34A";
                                } else {
                                  cellColor = "#16A34A";
                                }
                              }
                            } else {
                              displayVal = "-";
                            }

                            return (
                              <td
                                key={colIdx}
                                className={`td-value ${isLastCol ? "td-current" : ""}`}
                                style={{ color: isLastCol ? cellColor : "inherit" }}
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
                <div className="customTabs">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      className={`customTab ${activeTab === tab.key ? "active" : ""
                        }`}
                      onClick={() => setActiveTab(tab.key)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tabs Content */}
                <div className="tabContent">
                  {activeTab === "ROE" && (
                    <PurpleBarchart
                      isPrivate={isPrivateDeal}
                      data={dealDetails?.data?.financial_highlights?.financial_ratio?.data || []}
                    />
                  )}
                  {activeTab === "DEBT" && (
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
