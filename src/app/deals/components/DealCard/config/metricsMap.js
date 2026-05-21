export const METRICS_CONFIG = {
    featured_deal: {
        hero: [
            { label: "Issue Size", keys: ["issue_size_overall", "issue_size_amount", "target_funding_in_cr"], format: "currency", suffix: "Cr" },
            { label: "GMP", key: "estimated_gain_loss", format: "percent_gain" },
            { label: "Open Date", key: "listing_timeline", format: "date" }
        ],
        grid: []
    },
    public_standard: {
        hero: [
            { label: "Issue Size", keys: ["issue_size_overall", "issue_size_amount", "target_funding_in_cr"], format: "currency", suffix: "Cr" },
            { label: "GMP", key: "gmp", format: "currency", showGainLoss: true }
        ],
        grid: [
            { label: "Expected Val.", key: "expected_valuation", format: "currency", suffix: "Cr" },
            { label: "Revenue (FY'25)", key: "revenue_fy25_in_cr", format: "currency", suffix: "Cr" },
            { label: "PAT (FY'25)", key: "pat_fy25_in_cr", format: "currency", suffix: "Cr" },
            { label: "P/E Multiple", key: "pe_multiple", format: "multiplier" },
            { label: "Open Date", key: "listing_timeline", format: "date_short" },
            { label: "CAGR 3Y", key: "cagr_growth_3y_percent", format: "percent" }
        ]
    },

    ofs: {
        hero: [
            { label: "Valuation", key: "valuation_in_cr", format: "currency", suffix: "Cr" },
            { label: "Share Price", keys: ["per_share_price", "offer_price"], format: "currency", perShare: true }
        ],
        grid: [
            { label: "Min. Investment", key: "min_investment_amount_in_inr", format: "currency" },
            { label: "Revenue (FY'25)", key: "revenue_fy25_in_cr", format: "currency", suffix: "Cr" },
            { label: "PAT (FY'25)", key: "pat_fy25_in_cr", format: "currency", suffix: "Cr" },
            { label: "P/E Multiple", key: "pe_multiple", format: "multiplier" },
            { label: "Expected Listing", key: "listing_timeline", format: "date" },
            { label: "CAGR 3Y", key: "cagr_growth_3y_percent", format: "percent" }
        ]
    },
    series_a: {
        hero: [
            { label: "Round Size", key: "round_size_in_cr", format: "currency", suffix: "Cr" },
            { label: "Stage", key: "stage", format: "text" }
        ],
        grid: [
            { label: "Valuation", key: "valuation_in_cr", format: "currency", suffix: "Cr" },
            { label: "REV ARR", key: "rev_arr_in_cr", format: "currency", suffix: "Cr" },
            { label: "Gross Margin", key: "gross_margin_percent", format: "percent" },
            { label: "Growth YoY", key: "growth_yoy", format: "multiplier" },
            { label: "Min Ticket", key: "min_ticket_in_inr", format: "currency" }
        ]
    },
    unlisted_nse: {
        hero: [
            { label: "Valuation", key: "valuation_in_cr", format: "currency", suffix: "Cr" },
            { label: "Share Price", keys: ["per_share_price", "offer_price"], format: "currency", perShare: true }
        ],
        grid: [
            { label: "MIN. INVESTMENT", key: "min_investment_amount_in_inr", format: "currency", suffix: "Cr" },
            { label: "REVENUE (FY'25)", key: "revenue_fy25_in_cr", format: "currency", suffix: "Cr" },
            { label: "PAT (FY'25)", key: "pat_fy25_in_cr", format: "currency", suffix: "Cr" },
            { label: "P/E MULTIPLE", key: "pe_multiple", format: "multiplier" },
            { label: "EXPECTED LISTING", key: "listing_timeline", format: "date_short" },
            { label: "CAGR 3Y", key: "cagr_growth_3y_percent", format: "percent" }
        ]
    },
    pre_ipo_exclusive: {
        grid: [
            { label: "Valuation", key: "valuation_in_cr", format: "currency", suffix: "Cr" },
            { label: "Revenue (FY'25)", key: "revenue_fy25_in_cr", format: "currency", suffix: "Cr" },
            { label: "PAT (FY'25)", key: "pat_fy25_in_cr", format: "currency", suffix: "Cr" },
            { label: "P/E Multiple", key: "pe_multiple", format: "multiplier" },
            { label: "Expected Listing", key: "listing_timeline", format: "date_short" },
            { label: "CAGR 3Y", key: "cagr_growth_3y_percent", format: "percent" }
        ]
    }
};
