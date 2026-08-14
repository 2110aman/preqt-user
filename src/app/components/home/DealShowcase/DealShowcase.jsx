"use client";
import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import Cookies from 'js-cookie';
import styles from './DealShowcase.module.css';
import DealCard from '@/app/deals/components/DealCard';
import Link from 'next/link';

export default function DealShowcase() {
    const [featuredDeals, setFeaturedDeals] = useState([]);
    const [upcomingDeals, setUpcomingDeals] = useState([]);
    const [unlistedDeals, setUnlistedDeals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchShowcaseDeals = async () => {
            try {
                const token = Cookies.get('accessToken');
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_USER_BASE}admin/api/deals/all-deals/?limit=50&page=1`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            ...(token && { "Authorization": `Bearer ${token}` }),
                        },
                    }
                );

                if (res.ok) {
                    const responseData = await res.json();
                    const deals = responseData.data || [];

                    // =========================================================================
                    // FILTER CRITERIA FOR FEATURED DEALS:
                    // 1. check "deal_type" matches "public", "unlisted"
                    // 2. check "deal_sub_type" matches "featured"
                    //
                    // Developer Comment: These checks are made to retrieve and display 
                    // deals inside the Featured Deals section of the DealShowcase page component.
                    // If database schema, fields, or specific keys change in the future, 
                    // modify this filtering block accordingly.
                    // =========================================================================
                    const filteredFeatured = deals.filter(deal => 
                        (deal.deal_type?.toLowerCase() === 'public' || 
                         deal.deal_type?.toLowerCase() === 'unlisted') && 
                        deal.deal_sub_type?.toLowerCase() === 'featured'
                    );

                    setFeaturedDeals(filteredFeatured);

                    // =========================================================================
                    // FILTER CRITERIA FOR UPCOMING IPOs:
                    // 1. check "deal_type" matches "public"
                    // 2. check "deal_sub_type" is null (or undefined)
                    //
                    // Developer Comment: These two checks are made to retrieve and display 
                    // deals inside the Upcoming IPOs section of the DealShowcase page component.
                    // If database schema, fields, or specific keys change in the future, 
                    // modify this filtering block accordingly.
                    // =========================================================================
                    const filteredUpcoming = deals.filter(deal => 
                        deal.deal_type?.toLowerCase() === 'public' && 
                        (!deal.deal_sub_type || deal.deal_sub_type === null || deal.deal_sub_type === undefined || String(deal.deal_sub_type).trim().toLowerCase() === 'null')
                    );

                    setUpcomingDeals(filteredUpcoming);

                    // =========================================================================
                    // FILTER CRITERIA FOR UNLISTED SHARES:
                    // 1. check "deal_type" matches "unlisted"
                    // 2. check "deal_sub_type" is null (or undefined)
                    //
                    // Developer Comment: These two checks are made to retrieve and display 
                    // deals inside the Unlisted Shares section of the DealShowcase page component.
                    // If database schema, fields, or specific keys change in the future, 
                    // modify this filtering block accordingly.
                    // =========================================================================
                    const filteredUnlisted = deals.filter(deal => 
                        deal.deal_type?.toLowerCase() === 'unlisted' && 
                        (!deal.deal_sub_type || deal.deal_sub_type === null || deal.deal_sub_type === undefined || String(deal.deal_sub_type).trim().toLowerCase() === 'null')
                    );

                    setUnlistedDeals(filteredUnlisted);
                }
            } catch (error) {
                console.error("Error fetching deals for landing showcase:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchShowcaseDeals();
    }, []);

    if (loading) {
        return null;
    }

    return (
        <div className={styles.showcaseContainer}>
            <DealSection
                title="Featured Deals"
                subtitle="HIGHEST CONVICTION OPPORTUNITY"
                deals={featuredDeals}
                variantOverride="featured_deal"
            />

            <DealSection
                title="Upcoming IPOs"
                subtitle="INSTITUTIONAL GRADE IPOS"
                deals={upcomingDeals}
                redirectUrl="/deals?type=public"
                disclaimer="Grey Market Premium (GMPs) are shared for knowledge purpose only. PrEqt doesn’t promote or execute the trades."
            />

            <DealSection
                title="Unlisted Shares"
                subtitle="Established companies traded in the private market"
                deals={unlistedDeals}
                redirectUrl="/deals?type=unlisted"
                disclaimer="Disclaimer: Unlisted shares are unregulated & illiquid. This is NOT investment advice. Please do your own due diligence before investing."
            />
        </div>
    );
}

function CautionIcon({ className }) {
    return (
        <svg width="12" height="12" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <path d="M7.134 0.884C7.519 0.217 8.481 0.217 8.866 0.884L15.361 12.134C15.746 12.801 15.265 13.632 14.495 13.632H1.505C0.735 13.632 0.254 12.801 0.639 12.134L7.134 0.884Z" fill="#8C7333"/>
            <path d="M7.25 4.5H8.75L8.4 8.5H7.6L7.25 4.5Z" fill="#FFFFFF"/>
            <circle cx="8" cy="10.6" r="0.9" fill="#FFFFFF"/>
        </svg>
    );
}

function FallbackCard() {
    return (
        <div className={styles.fallbackContainer}>
            <div className={styles.shapesContainer}>
                <svg width="100%" height="100%" viewBox="0 0 49 49" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="gold-gradient" x1="0" y1="0" x2="1" y2="0" gradientTransform="rotate(113.27 0.5 0.5)">
                            <stop offset="15.04%" stopColor="#D2C299" />
                            <stop offset="84.96%" stopColor="#8E6B0F" />
                        </linearGradient>
                    </defs>
                    
                    {/* Top Left: Circle (shrinks and grows) */}
                    <circle className={styles.circleTop} cx="11.25" cy="11.25" r="11.25" fill="url(#gold-gradient)" />
                    
                    {/* Top Right: Square (translates top-down) */}
                    <rect className={styles.squareTop} x="26.5" y="0" width="22.5" height="22.5" rx="4" fill="url(#gold-gradient)" />
                    
                    {/* Bottom Left: Triangle (rotates 360deg and pauses) */}
                    <path className={styles.triangleBottom} d="M 11.25 29.5 L 19.5 46 L 3 46 Z" fill="url(#gold-gradient)" stroke="url(#gold-gradient)" strokeWidth="6" strokeLinejoin="round" />
                    
                    {/* Bottom Right: Circle (gets constricted when square is down) */}
                    <circle className={styles.circleBottom} cx="37.75" cy="37.75" r="11.25" fill="url(#gold-gradient)" />
                </svg>
            </div>
            <h3 className={styles.fallbackTitle}>Personalizing Opportunities</h3>
            <p className={styles.fallbackSubtitle}>Our team is curating the best deals for you.</p>
            <p className={styles.fallbackSubSubtitle}>Check back soon for exciting offers!</p>
        </div>
    );
}

function DealSection({ title, subtitle, deals, children, redirectUrl, titleColorClass, variantOverride, disclaimer }) {
    const hasDeals = deals && deals.length > 0;

    return (
        <div className={styles.section}>
            <div className={styles.header}>
                <div className={styles.headerTop}>
                    <h2 className={`${styles.title} ${titleColorClass ? styles[titleColorClass] : ''}`}>
                        {title}
                    </h2>
                    {redirectUrl && (
                        <Link href={redirectUrl} className={styles.arrowLink}>
                            <svg 
                                width="24" 
                                height="24" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                className={styles.arrowIcon}
                            >
                                <line x1="7" y1="17" x2="17" y2="7"></line>
                                <polyline points="7 7 17 7 17 17"></polyline>
                            </svg>
                        </Link>
                    )}
                </div>
                <p className={styles.subtitle}>{subtitle}</p>
            </div>

            {children}

            {hasDeals ? (
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
                                <DealCard deal={deal} isAuthenticated={true} isListView={false} variantOverride={variantOverride} />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            ) : (
                <FallbackCard />
            )}

            {disclaimer && (
                <div className={styles.disclaimerText}>
                    <CautionIcon className={styles.cautionIcon} />
                    <span>{disclaimer}</span>
                </div>
            )}
        </div>
    );
}

