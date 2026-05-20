"use client";
import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import styles from './DealShowcase.module.css';
import DealCard from '@/app/deals/components/DealCard';

export default function DealShowcase() {
    // Dummy Data for Featured Deals (using featured_deal layout)
    const featuredDeals = [
        {
            id: "featured-1",
            deal_type: "Featured",
            hidden_status: "live",
            tags: ["HIGH CONVICTION", "PR.EQT CHOICE", "IPO- SME", "MARKET", "IPO- SME"],
            ipo_review_rating: { status: true, weighted_composite_score: 4.2 },
            company_name: "Infratech Global",
            tag_line: "Undervalued infra player with strong government tailwinds mapping to 2030 budget goals.",
            issue_size_amount: 242.7,
            gmp: 18.9,
            listing_timeline: "Sept 2026",
            is_featured: true,
            sector_industry: "Infrastructure"
        },
        {
            id: "featured-2",
            deal_type: "Featured",
            hidden_status: "live",
            tags: ["HIGH CONVICTION", "PR.EQT CHOICE", "IPO- SME", "MARKET", "IPO- SME"],
            ipo_review_rating: { status: true, weighted_composite_score: 4.2 },
            company_name: "Infratech Global",
            tag_line: "Undervalued infra player with strong government tailwinds mapping to 2030 budget goals.",
            issue_size_amount: 242.7,
            gmp: 18.9,
            listing_timeline: "Sept 2026",
            is_featured: true,
            sector_industry: "Infrastructure"
        },
        {
            id: "featured-3",
            deal_type: "Featured",
            hidden_status: "live",
            tags: ["HIGH CONVICTION", "PR.EQT CHOICE", "IPO- SME", "MARKET", "IPO- SME"],
            ipo_review_rating: { status: true, weighted_composite_score: 4.2 },
            company_name: "Infratech Global",
            tag_line: "Undervalued infra player with strong government tailwinds mapping to 2030 budget goals.",
            issue_size_amount: 242.7,
            gmp: 18.9,
            listing_timeline: "Sept 2026",
            is_featured: true,
            sector_industry: "Infrastructure"
        },
        {
            id: "featured-4",
            deal_type: "Featured",
            hidden_status: "live",
            tags: ["HIGH CONVICTION", "PR.EQT CHOICE"],
            ipo_review_rating: { status: true, weighted_composite_score: 4.8 },
            company_name: "TechNova Solutions",
            tag_line: "Next-gen AI solutions for enterprise data management and analytics.",
            issue_size_amount: 150.5,
            gmp: 22.4,
            listing_timeline: "Oct 2026",
            is_featured: true,
            sector_industry: "Technology"
        },
        {
            id: "featured-5",
            deal_type: "Featured",
            hidden_status: "live",
            tags: ["IPO- SME", "MARKET"],
            ipo_review_rating: { status: true, weighted_composite_score: 3.9 },
            company_name: "GreenEnergy Corp",
            tag_line: "Leading renewable energy provider focusing on solar and wind projects.",
            issue_size_amount: 320.0,
            gmp: 15.2,
            listing_timeline: "Nov 2026",
            is_featured: true,
            sector_industry: "Energy"
        }
    ];

    // Dummy Data for Upcoming IPOs
    const upcomingDeals = [
        {
            id: "upcoming-1",
            deal_type: "Public",
            hidden_status: "live",
            tags: ["IPO- SME"],
            ipo_review_rating: { status: true, weighted_composite_score: 4.5 },
            company_name: "Ola Electric Mobility Ltd.",
            tag_line: "India’s leading EV two-wheeler manufacturer with strong vertical integration",
            issue_size_amount: 242.7,
            gmp: 18.9,
            target_funding_in_cr: 237.0, // Used in combo with GMP perhaps?
            expected_valuation: 3200.0,
            revenue_fy25_in_cr: 5200.0,
            pat_fy25_in_cr: 12.5,
            pe_multiple: 12.0,
            listing_timeline: "2027-09-01", // Sep '27
            cagr_growth_3y_percent: 62.5,
            is_featured: true,
            sector_industry: "Automotive"
        },
        {
            id: "upcoming-2",
            deal_type: "Public",
            hidden_status: "live",
            tags: ["IPO- SME"],
            ipo_review_rating: { status: true, weighted_composite_score: 4.5 },
            company_name: "Ola Electric Mobility Ltd.",
            tag_line: "India’s leading EV two-wheeler manufacturer with strong vertical integration",
            issue_size_amount: 242.7,
            gmp: 18.9,
            expected_valuation: 3200.0,
            revenue_fy25_in_cr: 5200.0,
            pat_fy25_in_cr: 12.5,
            pe_multiple: 12.0,
            listing_timeline: "2027-09-01",
            cagr_growth_3y_percent: 62.5,
            is_featured: true,
            sector_industry: "Automotive"
        },
        {
            id: "upcoming-3",
            deal_type: "Public",
            hidden_status: "live",
            tags: ["IPO- SME"],
            ipo_review_rating: { status: true, weighted_composite_score: 4.5 },
            company_name: "Ola Electric Mobility Ltd.",
            tag_line: "India’s leading EV two-wheeler manufacturer with strong vertical integration",
            issue_size_amount: 242.7,
            gmp: 18.9,
            expected_valuation: 3200.0,
            revenue_fy25_in_cr: 5200.0,
            pat_fy25_in_cr: 12.5,
            pe_multiple: 12.0,
            listing_timeline: "2027-09-01",
            cagr_growth_3y_percent: 62.5,
            is_featured: true,
            sector_industry: "Automotive"
        },
        {
            id: "upcoming-4",
            deal_type: "Public",
            hidden_status: "live",
            tags: ["IPO- MAIN"],
            ipo_review_rating: { status: true, weighted_composite_score: 4.1 },
            company_name: "HealthCare Plus",
            tag_line: "Expanding hospital chain with state-of-the-art medical facilities.",
            issue_size_amount: 500.0,
            gmp: 25.5,
            expected_valuation: 4500.0,
            revenue_fy25_in_cr: 8000.0,
            pat_fy25_in_cr: 45.0,
            pe_multiple: 15.0,
            listing_timeline: "2027-10-15",
            cagr_growth_3y_percent: 45.0,
            is_featured: true,
            sector_industry: "Healthcare"
        },
        {
            id: "upcoming-5",
            deal_type: "Public",
            hidden_status: "live",
            tags: ["IPO- SME"],
            ipo_review_rating: { status: true, weighted_composite_score: 3.8 },
            company_name: "RetailKing India",
            tag_line: "Fastest growing FMCG retail chain in tier 2 and tier 3 cities.",
            issue_size_amount: 120.0,
            gmp: 10.5,
            expected_valuation: 1200.0,
            revenue_fy25_in_cr: 2100.0,
            pat_fy25_in_cr: 8.5,
            pe_multiple: 18.0,
            listing_timeline: "2027-11-20",
            cagr_growth_3y_percent: 30.5,
            is_featured: true,
            sector_industry: "Retail"
        }
    ];

    // Dummy Data for Unlisted Shares
    const unlistedDeals = [
        {
            id: "unlisted-1",
            deal_type: "Unlisted", // uses unlisted_nse layout by default
            hidden_status: "live",
            tags: ["IPO- SME"],
            ipo_review_rating: { status: true, weighted_composite_score: 4.5 },
            company_name: "National Stock Exchange (NSE)",
            tag_line: "India’s leading EV two-wheeler manufacturer with strong vertical integration",
            valuation_in_cr: 380000.0,
            per_share_price: 3400,
            min_investment_amount_in_inr: 50000.0,
            revenue_fy25_in_cr: 12500.0,
            pat_fy25_in_cr: 7800.0,
            pe_multiple: 12.0,
            listing_timeline: "2027-09-01", // Sep '27
            cagr_growth_3y_percent: 62.5,
            is_featured: true,
            sector_industry: "Financial Services"
        },
        {
            id: "unlisted-2",
            deal_type: "Unlisted",
            hidden_status: "live",
            tags: ["IPO- SME"],
            ipo_review_rating: { status: true, weighted_composite_score: 4.5 },
            company_name: "National Stock Exchange (NSE)",
            tag_line: "India’s leading EV two-wheeler manufacturer with strong vertical integration",
            valuation_in_cr: 380000.0,
            per_share_price: 3400,
            min_investment_amount_in_inr: 50000.0,
            revenue_fy25_in_cr: 12500.0,
            pat_fy25_in_cr: 7800.0,
            pe_multiple: 12.0,
            listing_timeline: "2027-09-01",
            cagr_growth_3y_percent: 62.5,
            is_featured: true,
            sector_industry: "Financial Services"
        },
        {
            id: "unlisted-3",
            deal_type: "Unlisted",
            hidden_status: "live",
            tags: ["IPO- SME"],
            ipo_review_rating: { status: true, weighted_composite_score: 4.5 },
            company_name: "National Stock Exchange (NSE)",
            tag_line: "India’s leading EV two-wheeler manufacturer with strong vertical integration",
            valuation_in_cr: 380000.0,
            per_share_price: 3400,
            min_investment_amount_in_inr: 50000.0,
            revenue_fy25_in_cr: 12500.0,
            pat_fy25_in_cr: 7800.0,
            pe_multiple: 12.0,
            listing_timeline: "2027-09-01",
            cagr_growth_3y_percent: 62.5,
            is_featured: true,
            sector_industry: "Financial Services"
        },
        {
            id: "unlisted-4",
            deal_type: "Unlisted",
            hidden_status: "live",
            tags: ["PRE-IPO"],
            ipo_review_rating: { status: true, weighted_composite_score: 4.9 },
            company_name: "FinTech Innovators",
            tag_line: "Disrupting digital payments with blockchain-based solutions.",
            valuation_in_cr: 15000.0,
            per_share_price: 1200,
            min_investment_amount_in_inr: 25000.0,
            revenue_fy25_in_cr: 800.0,
            pat_fy25_in_cr: 150.0,
            pe_multiple: 25.0,
            listing_timeline: "2028-01-15",
            cagr_growth_3y_percent: 85.0,
            is_featured: true,
            sector_industry: "FinTech"
        },
        {
            id: "unlisted-5",
            deal_type: "Unlisted",
            hidden_status: "live",
            tags: ["STARTUP"],
            ipo_review_rating: { status: true, weighted_composite_score: 4.0 },
            company_name: "AgriTech Solutions",
            tag_line: "Smart farming technologies for sustainable agriculture.",
            valuation_in_cr: 5000.0,
            per_share_price: 450,
            min_investment_amount_in_inr: 10000.0,
            revenue_fy25_in_cr: 300.0,
            pat_fy25_in_cr: 40.0,
            pe_multiple: 18.5,
            listing_timeline: "2028-06-01",
            cagr_growth_3y_percent: 55.0,
            is_featured: true,
            sector_industry: "Agriculture"
        }
    ];

    return (
        <div className={styles.showcaseContainer}>
            <DealSection
                title="Featured Deals"
                subtitle="HIGHEST CONVICTION OPPORTUNITY"
                deals={featuredDeals}
            />

            <DealSection
                title="Upcoming IPOs"
                subtitle="INSTITUTIONAL GRADE IPOS"
                deals={upcomingDeals}
            />

            <DealSection
                title="Unlisted Shares"
                subtitle="Established companies traded in the private market"
                deals={unlistedDeals}
            />
        </div>
    );
}

function DealSection({ title, subtitle, deals, children, showArrow, titleColorClass }) {
    return (
        <div className={styles.section}>
            <div className={styles.header}>
                <h2 className={`${styles.title} ${titleColorClass ? styles[titleColorClass] : ''}`}>
                    {title}
                    {showArrow && <span className={styles.titleArrow}> ↗</span>}
                </h2>
                <p className={styles.subtitle}>{subtitle}</p>
            </div>

            {children}

            <div className={styles.cardRowWrapper}>
                <Swiper
                    slidesPerView="auto"
                    spaceBetween={16}
                    breakpoints={{
                        768: {
                            spaceBetween: 34,
                        },
                    }}
                    loop={deals.length >= 2}
                    grabCursor={true}
                    className={styles.cardRow}
                >
                    {deals.map(deal => (
                        <SwiperSlide key={deal.id} className={styles.cardWrapper}>
                            <DealCard deal={deal} isAuthenticated={true} isListView={false} />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
    );
}
