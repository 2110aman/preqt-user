"use client";
import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import Cookies from 'js-cookie';
import styles from './DealShowcase.module.css';
import DealCard from '@/app/deals/components/DealCard';

export default function DealShowcase() {
    const [featuredDeals, setFeaturedDeals] = useState([]);
    const [upcomingDeals, setUpcomingDeals] = useState([]);
    const [unlistedDeals, setUnlistedDeals] = useState([]);

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
                         deal.deal_type?.toLowerCase() === 'unlisted' || 
                         deal.deal_type?.toLowerCase() === 'unlisted') && 
                        deal.deal_sub_type?.toLowerCase() === 'featured'
                    );

                    if (filteredFeatured.length > 0) {
                        setFeaturedDeals(filteredFeatured);
                    }

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

                    if (filteredUpcoming.length > 0) {
                        setUpcomingDeals(filteredUpcoming);
                    }

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

                    if (filteredUnlisted.length > 0) {
                        setUnlistedDeals(filteredUnlisted);
                    }
                }
            } catch (error) {
                console.error("Error fetching deals for landing showcase:", error);
            }
        };

        fetchShowcaseDeals();
    }, []);

    return (
        <div className={styles.showcaseContainer}>
            {featuredDeals.length > 0 && (
                <DealSection
                    title="Featured Deals"
                    subtitle="HIGHEST CONVICTION OPPORTUNITY"
                    deals={featuredDeals}
                    variantOverride="featured_deal"
                />
            )}

            {upcomingDeals.length > 0 && (
                <DealSection
                    title="Upcoming IPOs"
                    subtitle="INSTITUTIONAL GRADE IPOS"
                    deals={upcomingDeals}
                />
            )}

            {unlistedDeals.length > 0 && (
                <DealSection
                    title="Unlisted Shares"
                    subtitle="Established companies traded in the private market"
                    deals={unlistedDeals}
                />
            )}
        </div>
    );
}

function DealSection({ title, subtitle, deals, children, showArrow, titleColorClass, variantOverride }) {
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
                            <DealCard deal={deal} isAuthenticated={true} isListView={false} variantOverride={variantOverride} />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
    );
}
