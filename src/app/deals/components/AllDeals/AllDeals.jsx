"use client";
import { useDealStore } from "@/store/dealStore";
import Loader from "@/app/components/Loader";
import styles from "../../../components/home/DealsTalk/DealsTalk.module.css";
import stylesdeals from "./AllDeals.module.css";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Cookies from "js-cookie";

import React from "react";
import Image from "next/image";
import { ArrowUpRight, ChevronDown, Lock, X } from "lucide-react";
import SignupFormPopup from "@/app/signup-form/SignupFormPopup";
import SignupTypePopup from "@/app/signup/SignupTypePopup";
import OtpPopup from "@/app/otp/OtpPopup";
import SigninPopup from "@/app/sign-in/SigninPopup";
import { formatDate } from "@/app/utils/FormatDate";
import LoadMoreLoader from "@/app/components/LoadMore/LoadMoreLoader";
import FilterPopup from "./FilterPopup";
import DealCard from "../DealCard";
import UnlockTeaser from "@/app/components/home/DealShowcase/UnlockTeaser";

function AllDealsContent() {
    const [loading, setLoading] = useState(true);
    const [allDeals, setAllDeals] = useState([]);
    const [error, setError] = useState([]);
    const { setSelectedDeal, appliedFilters, setAppliedFilters, selectedDealType, setSelectedDealType } = useDealStore();
    const authToken = Cookies.get('accessToken'); // or from cookies
    const router = useRouter();
    const searchParams = useSearchParams();

    const [viewType, setViewType] = useState('grid'); // 'grid' or 'list'
    const [showBtn, setShowBtn] = useState(-1);

    const [showSignin, setShowSignin] = useState(false);
    const [showSignupType, setShowSignupType] = useState(false);
    const [showSignupForm, setShowSignupForm] = useState(false);
    const [showOtp, setShowOtp] = useState(false);
    const [otpEmail, setOtpEmail] = useState("");
    const [otpSource, setOtpSource] = useState("");
    const [signupEmail, setSignupEmail] = useState("");
    const [signinEmail, setSigninEmail] = useState("");
    const [qaCounts, setQaCounts] = useState({});
    const [replies, setReplies] = useState({}); // Store replies per dealId: { [dealId]: data }
    const [countLoading, setCountLoading] = useState(false);
    const [countError, setCountError] = useState(false)
    const [redirectPath, setRedirectPath] = useState(null);

    const [showDealTypeDropdown, setShowDealTypeDropdown] = useState(false);
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDealTypeDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    const removeFilter = (category, value) => {
        setAppliedFilters(prev => {
            if (!prev) return null;
            const updated = { ...prev };
            if (category === 'ticketSize' || category === 'valuationRange') {
                delete updated[category];
            } else if (Array.isArray(updated[category])) {
                updated[category] = updated[category].filter(v => v !== value);
                if (updated[category].length === 0) delete updated[category];
            } else {
                delete updated[category];
            }
            const hasRemaining = Object.entries(updated).some(([key, val]) => {
                if (Array.isArray(val)) return val.length > 0;
                return val != null;
            });
            return hasRemaining ? updated : null;
        });
    };

    const dealTypeTabs = [
        { label: "ALL", value: "All" },
        { label: "Upcoming IPO", value: "Public" },
        { label: "Unlisted Shares", value: "Unlisted" },
        { label: "Private Deals", value: "Private" },
        { label: "Startup Deals", value: "Startup" }
    ];

    const availableStages = useMemo(() => {
        if (!allDeals) return [];
        const allStages = allDeals.map(deal => deal.company_stage).filter(Boolean);
        return [...new Set(allStages)].sort();
    }, [allDeals]);

    const revenueRange = useMemo(() => {
        if (!allDeals || allDeals.length === 0) return { min: 0, max: 100 };
        const revenues = allDeals.map(d => parseFloat(d.revenue_fy25_in_cr)).filter(n => !isNaN(n));
        if (revenues.length === 0) return { min: 0, max: 100 };
        return {
            min: Math.floor(Math.min(...revenues)),
            max: Math.ceil(Math.max(...revenues))
        };
    }, [allDeals]);

    const valuationRangeData = useMemo(() => {
        if (!allDeals || allDeals.length === 0) return { min: 0, max: 10000 };
        const valuations = allDeals.map(d => parseFloat(d.valuation_in_cr || d.target_valuation_in_cr)).filter(n => !isNaN(n));
        if (valuations.length === 0) return { min: 0, max: 10000 };
        return {
            min: Math.floor(Math.min(...valuations)),
            max: Math.ceil(Math.max(...valuations))
        };
    }, [allDeals]);

    const availableActivities = useMemo(() => {
        if (!allDeals) return [];
        const allActs = allDeals.flatMap(deal => {
            const freshness = deal.activity_freshness;
            if (Array.isArray(freshness)) return freshness;
            if (freshness && Array.isArray(freshness.data)) return freshness.data;
            return [];
        }).filter(Boolean);
        return [...new Set(allActs)].sort();
    }, [allDeals]);

    const availableParticipations = useMemo(() => {
        if (!allDeals) return [];
        const allParts = allDeals.flatMap(deal => {
            const validations = deal.participation_validations;
            if (Array.isArray(validations)) return validations;
            if (validations && Array.isArray(validations.data)) return validations.data;
            return [];
        }).filter(Boolean);
        return [...new Set(allParts)].sort();
    }, [allDeals]);

    const availableSectors = useMemo(() => {
        if (!allDeals) return [];
        const sectors = allDeals.map(deal => deal.sector_industry).filter(Boolean);
        return [...new Set(sectors)].sort();
    }, [allDeals]);

    const filteredDeals = useMemo(() => {
        // Restrict rendered opportunities to strictly public and unlisted/unlisted types (case-insensitive)
        let deals = allDeals.filter(deal => {
            const type = (deal.deal_type || '').toLowerCase();
            return type === 'public' || (type === 'unlisted' && (deal.deal_sub_type === null || deal.deal_sub_type === undefined));
        });

        // 1. Deal Type (Tabs)
        if (selectedDealType !== "All") {
            if (selectedDealType === "Unlisted") {
                deals = deals.filter(deal => 
                    (deal.deal_type || '').toLowerCase() === 'unlisted' && 
                    (deal.deal_sub_type === null || deal.deal_sub_type === undefined)
                );
            } else {
                deals = deals.filter(deal => (deal.deal_type || '').toLowerCase() === selectedDealType.toLowerCase());
            }
        }

        // 2. Applied Filters (Modal)
        if (appliedFilters) {
            // Deal Stage (Company Stage)
            if (appliedFilters.dealStages && appliedFilters.dealStages.length > 0) {
                deals = deals.filter(deal =>
                    appliedFilters.dealStages.includes(deal.company_stage)
                );
            }
            // Sector / Industry
            if (appliedFilters.sectors && appliedFilters.sectors.length > 0) {
                deals = deals.filter(deal =>
                    appliedFilters.sectors.includes(deal.sector_industry)
                );
            }
            // Deal Rating (Score)
            if (appliedFilters.dealRatings && appliedFilters.dealRatings.length > 0) {
                deals = deals.filter(deal => {
                    // This filter works ONLY on public deals
                    const type = (deal.deal_type || "").toLowerCase();
                    if (type !== "public") return false;

                    const score = parseFloat(deal.ipo_review_rating?.weighted_composite_score);
                    if (isNaN(score)) return false;

                    return appliedFilters.dealRatings.some(ratingLabel => {
                        if (ratingLabel === "4.5 & above") return score >= 4.5;
                        if (ratingLabel === "4.0 – 4.5") return score >= 4.0 && score < 4.5;
                        if (ratingLabel === "Below 4.0") return score < 4.0;
                        return false;
                    });
                });
            }
            // Ticket Size / Allocation (Revenue)
            if (appliedFilters.ticketSize) {
                const [min, max] = appliedFilters.ticketSize;
                deals = deals.filter(deal => {
                    const rev = parseFloat(deal.revenue_fy25_in_cr || 0);
                    return rev >= min && rev <= max;
                });
            }
            // Funding Status
            if (appliedFilters.fundingStatus && appliedFilters.fundingStatus.length > 0) {
                deals = deals.filter(deal => {
                    const raised = parseFloat(deal.raised_amount || 0);
                    const target = parseFloat(deal.target_funding_in_cr || deal.issue_size_overall || 0);
                    const percent = target > 0 ? (raised / target) * 100 : 0;

                    return appliedFilters.fundingStatus.some(lbl => {
                        if (lbl === "< 50% Funded") return percent < 50 && percent > 0;
                        if (lbl === "80%+ Funded") return percent >= 80;
                        if (lbl === "50% – 80% Funded") return percent >= 50 && percent <= 80;
                        return false;
                    });
                });
            }

            // Valuation Range
            if (appliedFilters.valuationRange) {
                const [min, max] = appliedFilters.valuationRange;
                deals = deals.filter(deal => {
                    const val = parseFloat(deal.valuation_in_cr || deal.target_valuation_in_cr || 0);
                    return val >= min && val <= max;
                });
            }

            // Activity & Freshness
            if (appliedFilters.activities && appliedFilters.activities.length > 0) {
                deals = deals.filter(deal => {
                    const freshness = deal.activity_freshness;
                    let data = [];
                    if (Array.isArray(freshness)) {
                        data = freshness;
                    } else if (freshness && Array.isArray(freshness.data)) {
                        data = freshness.data;
                    }
                    return appliedFilters.activities.some(activityVal =>
                        data.some(item => item.toLowerCase() === activityVal.toLowerCase())
                    );
                });
            }

            // Participation & Validation
            if (appliedFilters.participation && appliedFilters.participation.length > 0) {
                deals = deals.filter(deal => {
                    const validations = deal.participation_validations;
                    let data = [];
                    if (Array.isArray(validations)) {
                        data = validations;
                    } else if (validations && Array.isArray(validations.data)) {
                        data = validations.data;
                    }
                    return appliedFilters.participation.some(selected =>
                        data.some(item => item.toLowerCase() === selected.toLowerCase())
                    );
                });
            }
        }

        // Sort: public deals first
        return deals.sort((a, b) => {
            const aType = (a.deal_type || '').toLowerCase();
            const bType = (b.deal_type || '').toLowerCase();
            if (aType === 'public' && bType !== 'public') return -1;
            if (aType !== 'public' && bType === 'public') return 1;
            return 0;
        });
    }, [allDeals, selectedDealType, appliedFilters]);

    const dealsToRender = useMemo(() => {
        return filteredDeals;
    }, [filteredDeals]);

    const formatDealType = (type) => {
        if (type === "All") return "All Deals";
        if (type.toLowerCase() === "ccps") return "CCPS Deals";
        if (type.toLowerCase() === "unlisted") return "unlisted Deals";
        return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase() + " Deals";
    };


    const formatNumberWithCommas = (num) => {
        if (num === null || num === undefined) return "";
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };


    useEffect(() => {
        const shouldShowSignin = searchParams?.get("showSignin") === "true";
        if (!shouldShowSignin) return;

        // Capture redirect target (original deal page) if present
        const redirectParam = searchParams?.get("redirect");
        if (redirectParam) {
            setRedirectPath(redirectParam);
        }

        setShowSignin(true);

        const updatedParams = new URLSearchParams(searchParams.toString());
        updatedParams.delete("showSignin");
        updatedParams.delete("redirect");

        const nextUrl = updatedParams.toString()
            ? `/deals?${updatedParams.toString()}`
            : "/deals";

        router.replace(nextUrl);
    }, [searchParams, router]);

    useEffect(() => {
        if (allDeals.length === 0) return;

        allDeals.forEach((deal) => {
            fetchRepliesCount(deal.id, deal.deal_type === "private" || deal.deal_type === "ccps" || deal.deal_type === "unlisted");
        });
    }, [allDeals]);


    const fetchRepliesCount = async (dealId, isPrivateDeal) => {
        if (!dealId) return;

        try {
            setCountLoading(true);
            const token = isPrivateDeal ? Cookies.get("token") : null;

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_USER_BASE}admin/api/dashboard/replies-count/${dealId}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token && { Authorization: `Bearer ${token}` }),
                    },
                }
            );

            if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
            const data = await res.json();

            setQaCounts((prev) => ({
                ...prev,
                [dealId]: data?.data?.count || 0,
            }));

            // Store replies data per deal ID
            setReplies((prev) => ({
                ...prev,
                [dealId]: data,
            }));
        } catch (err) {
            console.error("Error fetching replies count:", err);
        } finally {
            setCountLoading(false);
        }
    };

    function daysUntilLive(liveAt) {
        const liveDate = new Date(liveAt);
        const today = new Date();

        // Convert to start of day to avoid time-zone partial day issues
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const startOfLive = new Date(liveDate.getFullYear(), liveDate.getMonth(), liveDate.getDate());

        const diffTime = startOfToday - startOfLive; // milliseconds
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays; // Could be 0 or negative
    }

    const getLatestReplyInitials = (questions = []) => {
        const allReplies = [];

        questions.forEach(q => {
            if (q.replies && q.replies.length > 0) {
                q.replies.forEach(r => {
                    allReplies.push({
                        solver: r.solver,
                        createdAt: r.createdAt
                    });
                });
            }
        });

        // Sort by newest first
        allReplies.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Take top 5
        const latestFive = allReplies.slice(0, 5);

        // Convert name → initials
        return latestFive.map(r => {
            if (!r.solver) return "A"; // default like your old PNG  
            const parts = r.solver.trim().split(" ");
            let initials = parts[0][0];
            if (parts.length > 1) initials += parts[1][0];
            return initials.toUpperCase();
        });
    };







    const getPrivateDealProgress = (deal) => {
        const raised =
            deal?.company_name === "Cricstudio Pvt. Ltd." || deal?.company_name === "avineet"
                ? 4.5
                : Number(deal?.raised_amount || 0);

        const target = Number(deal?.target_funding_in_cr || 0);

        if (target <= 0) {
            return {
                raised,
                percent: "0.00",
                width: "0%",
            };
        }

        const percent = ((raised / target) * 100).toFixed(1);

        return {
            raised,
            percent,
            width: `${Math.min(Number(percent), 100)}%`,
        };
    };






    const [otpPayload, setOtpPayload] = useState(null);

    const handleSigninOpen = () => {
        setShowSignin(true);
    };


    // SIGN IN → EMAIL OTP
    const handleSigninShowOtp = (payload) => {
        if (!payload?.type || !payload?.identifier) {
            console.error("Invalid OTP payload", payload);
            return;
        }

        setOtpPayload({
            flow: "signin",
            ...payload,
        });

        setShowSignin(false);
    };

    // SIGN UP → MOBILE OTP
    const handleSignupShowOtp = ({ email, phone }) => {
        if (!phone) return;

        setOtpPayload({
            flow: "signup",
            type: "mobile",
            identifier: phone,
            verifyEndpoint: "verify-register-otp",
            resendEndpoint: "resend-registeration-otp",
            email, // keep for later
        });

        setShowSignupForm(false);
    };
    const closeOtp = () => {
        setOtpPayload(null);
    };

    /* 
    ==========================================================================
    LEGACY RENDER FUNCTIONS (COMMENTED AS REQUESTED)
    ==========================================================================
    
    const renderPublicCard = (deal) => { ... }
    const renderPrivateCard = (deal) => { ... }
    const renderHiddenCard = (index) => { ... }
    */



    const [currPage, setCurrPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loadMore, setLoadMore] = useState(false);
    const hasMoreRef = useRef(null);



    const fetchDeals = async (page) => {
        try {
            if (page === 1) {
                setLoading(true);
            }
            const token = Cookies.get('accessToken');
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_USER_BASE}admin/api/deals/all-deals/?limit=50&page=${page}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token && { "Authorization": `Bearer ${token}` }),
                    },
                }
            );

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const responseData = await res.json();
            const deals = responseData.data || [];
            const pagination = responseData.pagination || {};

            if (page === 1) {
                setAllDeals(deals);
            } else {
                setAllDeals((prev) => [...prev, ...deals]);
            }

            const loadedCount = (page - 1) * 50 + deals.length;
            setHasMore((pagination.totalRecords || 0) > loadedCount);
        } catch (err) {
            console.error("Fetch error in AllDeals:", err);
            setError(err.message || "Failed to fetch deals");
        } finally {
            setLoading(false);
            setLoadMore(false);
        }
    };

    useEffect(() => {
        fetchDeals(currPage);
    }, [currPage]);


    useEffect(() => {
        if (!hasMore) return; // stop if no more pages
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loading) {
                    setCurrPage((prev) => prev + 1);
                    setLoadMore(true)
                }
            },
            { threshold: 1.0 } // triggers when fully visible
        );

        if (hasMoreRef.current) observer.observe(hasMoreRef.current);

        return () => {
            if (hasMoreRef.current) observer.unobserve(hasMoreRef.current);
        };
    }, [hasMore, loading]);




    if (loading) {
        return <Loader />;
    }
    // if (!allDeals || allDeals.length == 0) {
    //     return <div>No deals currently available.</div>;
    // }


    return (
        <>
            <div className={styles.AllDealsMainContainer}>
                <section className={`${styles.DealsTalkMainContainer} ${stylesdeals.DealsTalkMainContainer} ${appliedFilters ? stylesdeals.filtersActive : ""}`} >
                    <div className={`${stylesdeals.allDealsHeaderRow} ${appliedFilters ? stylesdeals.filtersActive : ""}`}>
                        <div className={stylesdeals.pageHeader}>
                            <div className={stylesdeals.backButtonHeader} onClick={() => router.push('/')}>
                                <span className={stylesdeals.backArrow}>
                                    <svg width="20" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="15 18 9 12 15 6"></polyline>
                                    </svg>
                                </span>
                                <h1 className={stylesdeals.mobileDealsTitle}>Deals</h1>
                            </div>
                            <h1 className={stylesdeals.desktopTitle}>Invest Opportunities</h1>
                            <p className={stylesdeals.desktopSubtitle}>Browse through institutional-grade private equity, SME IPOs, and<br />unlisted shares. Verified data for sophisticated capital.</p>
                        </div>

                        <div className={stylesdeals.filterBarRow}>
                            {/* Static Pill Tabs for Deal Types */}
                            <div className={stylesdeals.dealTypeTabs}>
                                {dealTypeTabs.map(tab => (
                                    <div
                                        key={tab.value}
                                        className={`${stylesdeals.tabItem} ${selectedDealType === tab.value ? stylesdeals.activeTab : ""}`}
                                        onClick={() => setSelectedDealType(tab.value)}
                                    >
                                        {tab.label}
                                    </div>
                                ))}
                            </div>

                            <div className={stylesdeals.headerActions} ref={dropdownRef}>
                                {/* View Toggle */}
                                <div className={stylesdeals.viewToggle}>
                                    <div className={`${stylesdeals.toggleSlider} ${viewType === 'list' ? stylesdeals.slideRight : ''}`} />
                                    <div
                                        className={`${stylesdeals.toggleIcon} ${viewType === 'grid' ? stylesdeals.active : ""}`}
                                        onClick={() => setViewType('grid')}
                                    >
                                        <img
                                            src={viewType === 'grid' ? '/grid.svg' : '/default.svg'}
                                            alt="Grid"
                                            style={{ filter: viewType === 'grid' ? 'invert(65%) sepia(54%) saturate(457%) hue-rotate(1deg) brightness(88%) contrast(89%)' : 'none' }}
                                        />
                                    </div>
                                    <div
                                        className={`${stylesdeals.toggleIcon} ${viewType === 'list' ? stylesdeals.active : ""}`}
                                        onClick={() => setViewType('list')}
                                    >
                                        <img
                                            src={viewType === 'list' ? '/listview.svg' : '/default.svg'}
                                            alt="List"
                                            style={{ filter: viewType === 'list' ? 'invert(65%) sepia(54%) saturate(457%) hue-rotate(1deg) brightness(88%) contrast(89%)' : 'none' }}
                                        />
                                    </div>
                                </div>

                                <div className={stylesdeals.mobileRightActions}>
                                    {/* Filters Button */}
                                    <button className={stylesdeals.filterBtn} onClick={() => setShowFilterPopup(!showFilterPopup)}>
                                        <img src="/filterIcon.svg" alt="filter" />
                                        <span>Filters</span>
                                    </button>

                                    {/* Mobile Deal Type Dropdown */}
                                    <div className={stylesdeals.dealTypeDropdownContainer}>
                                        <button
                                            className={`${stylesdeals.dealTypeDropdownBtn} ${showDealTypeDropdown ? stylesdeals.activeBtn : ""}`}
                                            onClick={() => setShowDealTypeDropdown(!showDealTypeDropdown)}
                                        >
                                            <span>
                                                {selectedDealType === "All" ? "Deal Type" :
                                                    dealTypeTabs.find(t => t.value === selectedDealType)?.label || "Deal Type"}
                                            </span>
                                            <ChevronDown size={16} className={`${stylesdeals.chevronIcon} ${showDealTypeDropdown ? stylesdeals.chevronIconActive : ""}`} />
                                        </button>

                                        <div className={`${stylesdeals.dealTypeDropdownMenu} ${showDealTypeDropdown ? stylesdeals.dropdownOpen : ""}`}>
                                            {dealTypeTabs.map(tab => (
                                                <div
                                                    key={tab.value}
                                                    className={`${stylesdeals.dropdownItem} ${selectedDealType === tab.value ? stylesdeals.dropdownItemActive : ""}`}
                                                    onClick={() => {
                                                        setSelectedDealType(tab.value);
                                                        setShowDealTypeDropdown(false);
                                                    }}
                                                >
                                                    {tab.label}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {appliedFilters && (
                        <div className={stylesdeals.appliedFiltersRow}>
                            {Object.entries(appliedFilters).map(([category, values]) => {
                                if (category === 'ticketSize' || category === 'valuationRange') {
                                    if (!values || !Array.isArray(values) || values.length !== 2) return null;
                                    const [min, max] = values;
                                    const label = category === 'ticketSize' ? `Ticket Size / Allocation: ₹${min}Cr - ₹${max}Cr` : `Valuation Range: ₹${min}Cr - ₹${max}Cr`;
                                    return (
                                        <div key={category} className={stylesdeals.filterTag}>
                                            <span>{label}</span>
                                            <div onClick={() => removeFilter(category, null)} className={stylesdeals.removeFilterBtn}>
                                                <X size={14} />
                                            </div>
                                        </div>
                                    );
                                }
                                if (!Array.isArray(values) || values.length === 0) return null;
                                return values.map((val) => (
                                    <div key={`${category}-${val}`} className={stylesdeals.filterTag}>
                                        <span>
                                            {category === "dealRatings" ? `⭐ ${val}` : val}
                                        </span>
                                        <div onClick={() => removeFilter(category, val)} className={stylesdeals.removeFilterBtn}>
                                            <X size={14} />
                                        </div>
                                    </div>
                                ));
                            })}
                        </div>
                    )}

                    {selectedDealType === "Private" || selectedDealType === "Startup" ? (
                        <div style={{ width: "100%", marginTop: "10px" }}>
                            <UnlockTeaser className={stylesdeals.teaserNoMargin} isAllDeals={true} isListView={viewType === 'list'} />
                        </div>
                    ) : (
                        <>
                            <div className={`${styles.carouselWrapper} carouselWrapper`}>
                                <div className={`row g-0 ${styles.dealsRow} ${viewType === 'list' ? stylesdeals.listView : ""}`}>
                                    {dealsToRender && dealsToRender.length > 0 ? (
                                        <>
                                            {dealsToRender.map((deal, index) => (
                                                <div key={deal.id} className={`${viewType === 'grid' ? 'col-lg-3' : 'col-lg-12'} col-md-6 col-sm-12 ${stylesdeals.dealCardCol}`}>
                                                    <DealCard
                                                        deal={deal}
                                                        isAuthenticated={!!authToken}
                                                        onLoginClick={handleSigninOpen}
                                                        qaCount={qaCounts[deal.id] || 0}
                                                        replies={replies[deal.id]}
                                                        isListView={viewType === 'list'}
                                                    />
                                                </div>
                                            ))}
                                            {viewType === 'grid' && selectedDealType === "All" && (
                                                <div className={`col-lg-3 col-md-6 col-sm-12 ${stylesdeals.dealCardCol}`}>
                                                    <UnlockTeaser isGridCard={true} isAllDeals={true} />
                                                </div>
                                            )}
                                            {viewType === 'list' && (
                                                <div className="col-lg-12 col-md-12 col-sm-12" style={{ width: "100%", marginTop: "10px" }}>
                                                    <UnlockTeaser className={stylesdeals.teaserNoMargin} isAllDeals={true} isListView={true} />
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className={stylesdeals.noDealsFound}>
                                            <p>No deals found matching your filters.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {
                                hasMore && loadMore &&
                                <LoadMoreLoader />
                            }
                            {hasMore && <div ref={hasMoreRef} style={{ height: "1px" }} >
                            </div>}
                        </>
                    )}
                </section>
            </div>
            {showSignin && (
                <SigninPopup
                    show={showSignin}
                    onHide={() => setShowSignin(false)}
                    onShowOtp={handleSigninShowOtp}
                    onShowSignUp={() => {
                        setShowSignin(false);
                        setShowSignupType(true);
                    }}
                />
            )}

            {/* SIGN UP TYPE */}
            {showSignupType && (
                <SignupTypePopup
                    show
                    onHide={() => setShowSignupType(false)}
                    onProceed={() => {
                        setShowSignupType(false);
                        setShowSignupForm(true);
                    }}
                    onBack={() => {
                        setShowSignupType(false);
                        setShowSignin(true);
                    }}
                />
            )}

            {/* SIGN UP FORM */}
            {showSignupForm && (
                <SignupFormPopup
                    show
                    onHide={() => setShowSignupForm(false)}
                    onBack={() => {
                        setShowSignupForm(false);
                        setShowSignupType(true);
                    }}
                    onShowOtp={handleSignupShowOtp}
                />
            )}

            {/* OTP POPUP (NO showOtp FLAG) */}
            {otpPayload && (
                <OtpPopup
                    {...otpPayload}
                    show
                    handleClose={closeOtp}
                    handleBack={() => {
                        const flow = otpPayload.flow;
                        closeOtp();
                        flow === "signin"
                            ? setShowSignin(true)
                            : setShowSignupForm(true);
                    }}
                    onVerified={() => {
                        closeOtp();
                    }}
                />
            )}

            <FilterPopup
                show={showFilterPopup}
                onHide={() => setShowFilterPopup(false)}
                availableStages={availableStages}
                revenueRange={revenueRange}
                valuationRange={valuationRangeData}
                availableActivities={availableActivities}
                availableParticipations={availableParticipations}
                availableSectors={availableSectors}
                initialFilters={appliedFilters}
                onApply={(filters) => {
                    setAppliedFilters(filters);
                }}
            />
        </>

    );
}


export default function AllDeals() {
    return (
        <Suspense fallback={<Loader />}>
            <AllDealsContent />
        </Suspense>
    );
} 
