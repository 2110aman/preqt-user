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
import { ArrowUpRight, Check, ChevronDown, Lock, Search, SlidersHorizontal, X } from "lucide-react";
import SignupFormPopup from "@/app/signup-form/SignupFormPopup";
import SignupTypePopup from "@/app/signup/SignupTypePopup";
import OtpPopup from "@/app/otp/OtpPopup";
import SigninPopup from "@/app/sign-in/SigninPopup";
import { formatDate } from "@/app/utils/FormatDate";
import LoadMoreLoader from "@/app/components/LoadMore/LoadMoreLoader";
import FilterPopup from "./FilterPopup";
import DealCard from "../DealCard";
import UnlockTeaser from "@/app/components/home/DealShowcase/UnlockTeaser";

/**
 * Safely parses a close date string (YYYY-MM-DD or ISO timestamp)
 * and returns boundaries for the start and end of that day in local time.
 */
function parseCloseDate(dateStr) {
    if (!dateStr) return null;
    const str = String(dateStr).trim();
    // Handle standard YYYY-MM-DD format
    const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match && !str.includes('T') && !str.includes('Z')) {
        const year = parseInt(match[1], 10);
        const month = parseInt(match[2], 10) - 1;
        const day = parseInt(match[3], 10);
        return {
            startOfDay: new Date(year, month, day, 0, 0, 0, 0).getTime(),
            endOfDay: new Date(year, month, day, 23, 59, 59, 999).getTime(),
            year,
            month,
            day
        };
    }
    const d = new Date(str);
    if (isNaN(d.getTime())) return null;
    const year = d.getFullYear();
    const month = d.getMonth();
    const day = d.getDate();
    return {
        startOfDay: new Date(year, month, day, 0, 0, 0, 0).getTime(),
        endOfDay: new Date(year, month, day, 23, 59, 59, 999).getTime(),
        exactTime: d.getTime(),
        year,
        month,
        day
    };
}

function AllDealsContent({ initialDeals = [], initialPagination = {}, initialCategory = null }) {
    const [localCategory, setLocalCategory] = useState(initialCategory || null);
    const [loading, setLoading] = useState(!initialDeals || initialDeals.length === 0);
    const [allDeals, setAllDeals] = useState(initialDeals);
    const [error, setError] = useState([]);
    const { setSelectedDeal, appliedFilters, setAppliedFilters, selectedDealType: storeDealType, setSelectedDealType } = useDealStore();
    
    // Guarantee synchronous initial category on first render without flash of "All"
    const selectedDealType = localCategory !== null ? localCategory : (initialCategory || storeDealType || "All");

    const authToken = Cookies.get('accessToken'); // or from cookies
    const router = useRouter();
    const searchParams = useSearchParams();

    const [viewType, setViewType] = useState('list'); // 'grid' or 'list'
    const [showBtn, setShowBtn] = useState(-1);

    const [companySearch, setCompanySearch] = useState("");
    const [sortBy, setSortBy] = useState("latest");
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [tagSearch, setTagSearch] = useState("");
    const [showTagDropdown, setShowTagDropdown] = useState(false);
    const [selectedTags, setSelectedTags] = useState([]);
    const [fetchedTags, setFetchedTags] = useState([]);
    const [fetchedSectors, setFetchedSectors] = useState([]);

    const sortDropdownRef = useRef(null);
    const mobileSortDropdownRef = useRef(null);
    const tagDropdownRef = useRef(null);

    const sortOptions = useMemo(() => {
        const isUnlisted = (selectedDealType || "").toLowerCase() === "unlisted";
        const allOptions = [
            { label: "Latest", value: "latest" },
            { label: "Closing Soon", value: "closing_soon" },
            { label: "Most Viewed", value: "most_viewed" },
            { label: "High Conviction", value: "high_conviction" }
        ];
        if (isUnlisted) {
            return allOptions.filter(opt => opt.value !== "closing_soon");
        }
        return allOptions;
    }, [selectedDealType]);

    useEffect(() => {
        if ((selectedDealType || "").toLowerCase() === "unlisted" && sortBy === "closing_soon") {
            setSortBy("latest");
        }
    }, [selectedDealType, sortBy]);

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
            const clickedSort = (sortDropdownRef.current && sortDropdownRef.current.contains(event.target)) ||
                                (mobileSortDropdownRef.current && mobileSortDropdownRef.current.contains(event.target));
            if (!clickedSort) {
                setShowSortDropdown(false);
            }
            if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target)) {
                setShowTagDropdown(false);
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
        { label: "ALL", value: "All", slug: "" },
        { label: "Upcoming IPO", value: "Upcoming", slug: "upcoming-ipo" },
        { label: "IPO", value: "Public", slug: "ipo" },
        { label: "Unlisted Shares", value: "Unlisted", slug: "unlisted-shares" },
        { label: "Private Deals", value: "Private", slug: "private-deals" },
        { label: "Startup Deals", value: "Startup", slug: "startup-deals" }
    ];

    useEffect(() => {
        if (initialCategory) {
            setLocalCategory(initialCategory);
            setSelectedDealType(initialCategory);
        }
    }, [initialCategory, setSelectedDealType]);

    const handleTabSelect = (tab) => {
        setLocalCategory(tab.value);
        setSelectedDealType(tab.value);
        if (typeof window !== "undefined") {
            const newPath = tab.slug ? `/deals/${tab.slug}` : "/deals";
            if (window.location.pathname !== newPath) {
                window.history.pushState(null, "", newPath);
            }
        }
    };

    useEffect(() => {
        const typeParam = searchParams?.get("type");
        if (typeParam) {
            const matchingTab = dealTypeTabs.find(
                (tab) => tab.value.toLowerCase() === typeParam.toLowerCase() || tab.label.toLowerCase() === typeParam.toLowerCase()
            );
            if (matchingTab) {
                setSelectedDealType(matchingTab.value);
            }
        }
    }, [searchParams, setSelectedDealType]);

    const availableStages = useMemo(() => {
        if (!allDeals) return [];
        const allStages = allDeals.map(deal => deal.company_stage).filter(Boolean);
        return [...new Set(allStages)].sort();
    }, [allDeals]);

    const getVal = (val) => (typeof val === 'object' && val !== null && 'data' in val) ? val.data : val;

    const revenueRange = useMemo(() => {
        if (!allDeals || allDeals.length === 0) return { min: 0, max: 100 };
        const revenues = allDeals.map(d => parseFloat(getVal(d.revenue_fy25_in_cr))).filter(n => !isNaN(n));
        if (revenues.length === 0) return { min: 0, max: 100 };
        return {
            min: Math.floor(Math.min(...revenues)),
            max: Math.ceil(Math.max(...revenues))
        };
    }, [allDeals]);

    const valuationRangeData = useMemo(() => {
        if (!allDeals || allDeals.length === 0) return { min: 0, max: 10000 };
        const valuations = allDeals.map(d => parseFloat(getVal(d.valuation_in_cr) || getVal(d.target_valuation_in_cr))).filter(n => !isNaN(n));
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
        if (!fetchedSectors || !Array.isArray(fetchedSectors)) return [];
        const sectorSet = new Set();
        fetchedSectors.forEach(s => {
            const name = typeof s === 'string'
                ? s.trim()
                : (s && typeof s === 'object' ? (s.name || s.sector || s.sector_name || s.title || s.label || s.value || '') : '');
            if (name) sectorSet.add(name);
        });
        return Array.from(sectorSet).sort((a, b) => a.localeCompare(b));
    }, [fetchedSectors]);

    useEffect(() => {
        const fetchCompanySectors = async () => {
            try {
                const token = Cookies.get('accessToken');
                const rawBaseUrl = process.env.NEXT_PUBLIC_USER_BASE || "https://api.preqt.club/";
                const baseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl : `${rawBaseUrl}/`;
                const res = await fetch(`${baseUrl}admin/api/deals/company-sectors`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token && { "Authorization": `Bearer ${token}` }),
                    },
                });
                if (res.ok) {
                    const result = await res.json();
                    let sectorArray = [];
                    if (result?.data?.data && Array.isArray(result.data.data)) {
                        sectorArray = result.data.data;
                    } else if (result?.data && Array.isArray(result.data)) {
                        sectorArray = result.data;
                    } else if (Array.isArray(result)) {
                        sectorArray = result;
                    }
                    const parsedSectors = sectorArray
                        .map(s => {
                            if (typeof s === 'string') return s.trim();
                            if (s && typeof s === 'object') {
                                return (s.name || s.sector || s.sector_name || s.title || s.label || s.value || '').trim();
                            }
                            return '';
                        })
                        .filter(Boolean);

                    setFetchedSectors([...new Set(parsedSectors)]);
                }
            } catch (err) {
                console.error("Failed to fetch company sectors:", err);
            }
        };

        fetchCompanySectors();
    }, []);

    useEffect(() => {
        const fetchDealTags = async () => {
            try {
                const token = Cookies.get('accessToken');
                const rawBaseUrl = process.env.NEXT_PUBLIC_USER_BASE || "https://api.preqt.club/";
                const baseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl : `${rawBaseUrl}/`;
                const res = await fetch(`${baseUrl}admin/api/deals/get-all-deal-tags`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token && { "Authorization": `Bearer ${token}` }),
                    },
                });
                if (res.ok) {
                    const result = await res.json();
                    let tagArray = [];
                    if (result?.data?.data && Array.isArray(result.data.data)) {
                        tagArray = result.data.data;
                    } else if (result?.data && Array.isArray(result.data)) {
                        tagArray = result.data;
                    }
                    if (tagArray.length > 0) {
                        setFetchedTags(tagArray);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch deal tags:", err);
            }
        };

        fetchDealTags();
    }, []);

    const allAvailableTags = useMemo(() => {
        const tagSet = new Set();
        if (fetchedTags && Array.isArray(fetchedTags)) {
            fetchedTags.forEach(t => t && tagSet.add(String(t).trim()));
        }
        if (allDeals && Array.isArray(allDeals)) {
            allDeals.forEach(deal => {
                if (Array.isArray(deal.tags)) {
                    deal.tags.forEach(t => {
                        const tagText = typeof t === 'string' ? t.trim() : (t && typeof t === 'object' ? (t.name || t.tag || t.label || t.title || '') : '');
                        if (tagText && tagText !== '[object Object]') tagSet.add(tagText);
                    });
                }
                if (Array.isArray(deal.key_highlights)) {
                    deal.key_highlights.forEach(h => {
                        const hText = typeof h === 'string' ? h.trim() : (h && typeof h === 'object' ? (h.name || h.tag || h.label || h.title || '') : '');
                        if (hText && hText !== '[object Object]') tagSet.add(hText);
                    });
                }
                if (Array.isArray(deal.companies_sectors)) {
                    deal.companies_sectors.forEach(s => {
                        const secText = typeof s === 'string' ? s.trim() : (s?.name || s?.sector || '');
                        if (secText) tagSet.add(secText);
                    });
                }
                if (deal.sector_industry) {
                    tagSet.add(String(deal.sector_industry).trim());
                }
                if (deal.company_stage) {
                    tagSet.add(String(deal.company_stage).trim());
                }
                if (deal.stage) {
                    tagSet.add(String(deal.stage).trim());
                }
            });
        }
        if (tagSet.size === 0) {
            ["SME", "IPO", "High Conviction", "Manufacturing", "Pre-IPO", "Unlisted", "Tech", "Saas", "Fintech", "AI"].forEach(t => tagSet.add(t));
        }
        return Array.from(tagSet);
    }, [allDeals, fetchedTags]);

    const suggestedTags = useMemo(() => {
        const query = tagSearch.trim().toLowerCase();
        return allAvailableTags.filter(tag => {
            if (selectedTags.some(st => st.toLowerCase() === tag.toLowerCase())) return false;
            if (!query) return true;
            return tag.toLowerCase().includes(query);
        });
    }, [allAvailableTags, tagSearch, selectedTags]);

    const handleAddTag = (tag) => {
        if (!tag) return;
        const trimmed = String(tag).trim();
        if (!selectedTags.some(t => t.toLowerCase() === trimmed.toLowerCase())) {
            setSelectedTags(prev => [...prev, trimmed]);
        }
        setTagSearch("");
        setShowTagDropdown(false);
    };

    useEffect(() => {
        const tagParam = searchParams?.get("tag");
        if (tagParam) {
            handleAddTag(tagParam);
        }
    }, [searchParams]);

    const handleRemoveTag = (tagToRemove) => {
        setSelectedTags(prev => prev.filter(t => t.toLowerCase() !== tagToRemove.toLowerCase()));
    };

    const handleClearAllTags = () => {
        setSelectedTags([]);
        setTagSearch("");
    };

    const matchTag = (deal, tag) => {
        if (!deal || !tag) return false;
        const t = tag.trim().toLowerCase();
        if (Array.isArray(deal.tags) && deal.tags.some(item => {
            const str = typeof item === 'string' ? item : (item && typeof item === 'object' ? (item.name || item.tag || item.label || item.title || '') : '');
            return str && (str.toLowerCase() === t || str.toLowerCase().includes(t) || t.includes(str.toLowerCase()));
        })) return true;
        if (Array.isArray(deal.key_highlights) && deal.key_highlights.some(item => {
            const str = typeof item === 'string' ? item : (item && typeof item === 'object' ? (item.name || item.tag || item.label || item.title || '') : '');
            return str && (str.toLowerCase() === t || str.toLowerCase().includes(t) || t.includes(str.toLowerCase()));
        })) return true;
        if (t === "sme" && (deal.is_sme || (deal.deal_type || '').toLowerCase() === 'public' || (deal.tags && deal.tags.some(x => {
            const str = typeof x === 'string' ? x : (x && typeof x === 'object' ? (x.name || x.tag || x.label || x.title || '') : '');
            return str && str.toLowerCase().includes('sme');
        })))) return true;
        if (t === "ipo" && ((deal.deal_type || '').toLowerCase() === 'public' || (deal.deal_type || '').toLowerCase() === 'upcoming')) return true;
        if (t === "high conviction" && (deal.hight_conviction === true || deal.hight_conviction === "true" || deal.high_conviction === true || deal.high_conviction === "true")) return true;
        if (Array.isArray(deal.companies_sectors) && deal.companies_sectors.some(s => {
            const secText = typeof s === 'string' ? s.toLowerCase() : (s?.name || s?.sector || '').toLowerCase();
            return secText && (secText === t || secText.includes(t) || t.includes(secText));
        })) return true;
        if (deal.sector_industry && (deal.sector_industry.toLowerCase().includes(t) || t.includes(deal.sector_industry.toLowerCase()))) return true;
        if (deal.company_stage && (deal.company_stage.toLowerCase().includes(t) || t.includes(deal.company_stage.toLowerCase()))) return true;
        if (deal.stage && (deal.stage.toLowerCase().includes(t) || t.includes(deal.stage.toLowerCase()))) return true;
        if (deal.company_name && (deal.company_name.toLowerCase().includes(t) || t.includes(deal.company_name.toLowerCase()))) return true;
        return false;
    };

    const filteredDeals = useMemo(() => {
        // Restrict rendered opportunities to selected types (case-insensitive)
        let deals = allDeals.filter(deal => {
            const type = (deal.deal_type || '').toLowerCase();
            if (selectedDealType === "Private") {
                return type === 'private' || type === 'ofs' || type === 'ccps';
            }
            if (selectedDealType === "Startup") {
                return type === 'startup';
            }
            return type === 'public' || type === 'unlisted';
        });

        // 1. Deal Type (Tabs)
        if (selectedDealType === "Upcoming") {
            deals = deals.filter(deal => {
                const type = (deal.deal_type || '').toLowerCase();
                if (type !== 'public') return false;
                const statusRaw = (deal.hidden_status || '').toLowerCase();
                return statusRaw === 'upcoming' || statusRaw === 'up comming' || statusRaw === 'draft' || (statusRaw !== 'live' && statusRaw !== 'closed');
            });
        } else if (selectedDealType === "Public") {
            deals = deals.filter(deal => (deal.deal_type || '').toLowerCase() === 'public');
        } else if (selectedDealType !== "All") {
            deals = deals.filter(deal => (deal.deal_type || '').toLowerCase() === selectedDealType.toLowerCase());
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
                deals = deals.filter(deal => {
                    const filterSectorsLower = appliedFilters.sectors.map(s => String(s).trim().toLowerCase());

                    // 1. Check deal.companies_sectors (array of strings or objects)
                    if (Array.isArray(deal.companies_sectors) && deal.companies_sectors.length > 0) {
                        const match = deal.companies_sectors.some(cs => {
                            const name = typeof cs === 'string' ? cs.trim() : (cs?.name || cs?.sector || cs?.title || cs?.label || '');
                            return filterSectorsLower.includes(name.toLowerCase());
                        });
                        if (match) return true;
                    } else if (typeof deal.companies_sectors === 'string' && deal.companies_sectors.trim()) {
                        if (filterSectorsLower.includes(deal.companies_sectors.trim().toLowerCase())) {
                            return true;
                        }
                    }

                    // 2. Check deal.company_sectors (array of strings or objects)
                    if (Array.isArray(deal.company_sectors) && deal.company_sectors.length > 0) {
                        const match = deal.company_sectors.some(cs => {
                            const name = typeof cs === 'string' ? cs.trim() : (cs?.name || cs?.sector || cs?.title || cs?.label || '');
                            return filterSectorsLower.includes(name.toLowerCase());
                        });
                        if (match) return true;
                    }

                    // 3. Fallback to legacy sector_industry / company_sector / sector
                    const legacySector = (deal.sector_industry || deal.company_sector || deal.sector || '').trim().toLowerCase();
                    if (legacySector && filterSectorsLower.includes(legacySector)) {
                        return true;
                    }

                    return false;
                });
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
                    const rev = parseFloat(getVal(deal.revenue_fy25_in_cr) || 0);
                    return rev >= min && rev <= max;
                });
            }
            // Funding Status
            if (appliedFilters.fundingStatus && appliedFilters.fundingStatus.length > 0) {
                deals = deals.filter(deal => {
                    const raised = parseFloat(deal.raised_amount || 0);
                    const target = parseFloat(getVal(deal.target_funding_in_cr) || getVal(deal.issue_size_overall) || 0);
                    const percent = target > 0 ? (raised / target) * 100 : 0;

                    return appliedFilters.fundingStatus.some(lbl => {
                        if (lbl === "< 50% Funded") return percent < 50 && percent >=0;
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
                    const val = parseFloat(getVal(deal.valuation_in_cr) || getVal(deal.target_valuation_in_cr) || 0);
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

        // 3. Search Company Query
        if (companySearch && companySearch.trim()) {
            const query = companySearch.trim().toLowerCase();
            deals = deals.filter(deal => {
                const name = (deal.company_name || '').toLowerCase();
                const brand = (deal.brand_name || '').toLowerCase();
                const intro = (deal.company_intro || '').toLowerCase();
                const tagline = (deal.tag_line || '').toLowerCase();
                const symbol = (deal.symbol || '').toLowerCase();
                return name.includes(query) || brand.includes(query) || intro.includes(query) || tagline.includes(query) || symbol.includes(query);
            });
        }

        // 4. Selected Tags Filter
        if (selectedTags.length > 0) {
            deals = deals.filter(deal => selectedTags.every(tag => matchTag(deal, tag)));
        }

        // 5. Sorting
        // =====================================================================
        // Sorting Strategies:
        // - "closing_soon":
        //     1. Only includes public deals that are not explicitly marked closed.
        //     2. Preserves deals closing today (keeps them active until 23:59:59).
        //     3. Deals closing TODAY appear at the very top of the list.
        //     4. Future closing deals appear in ascending order (nearest date first).
        //     5. Secondary sort: newest createdAt descending.
        // - "most_viewed":
        //     Sorts deals by user visit count descending.
        // - "high_conviction":
        //     Filters exclusively for high-conviction deals, sorted by latest createdAt.
        // - "latest" (Default):
        //     Sorts deals by creation date descending (newest deals first).
        // =====================================================================
        if (sortBy === 'closing_soon') {
            const now = new Date();
            const todayYear = now.getFullYear();
            const todayMonth = now.getMonth();
            const todayDate = now.getDate();
            const startOfToday = new Date(todayYear, todayMonth, todayDate, 0, 0, 0, 0).getTime();

            // Helper to determine if a parsed close date matches today's calendar date
            const isToday = (parsed) => {
                if (!parsed) return false;
                return parsed.year === todayYear && parsed.month === todayMonth && parsed.day === todayDate;
            };

            // Step 1: Filter out non-public deals, closed deals, and deals that closed strictly before today
            deals = deals.filter(deal => {
                const isPublic = (deal.deal_type || '').toLowerCase() === 'public';
                if (!isPublic) return false;

                // Exclude explicitly closed deals
                const statusRaw = (deal.hidden_status || deal.status || '').toLowerCase().trim();
                if (statusRaw === 'closed' || statusRaw === 'round closed') return false;

                // Exclude deals whose closing date ended strictly before today
                const closeDateStr = deal.timeline_ipo_close_date || deal.bidding_end_date || deal.close_date;
                if (closeDateStr) {
                    const parsed = parseCloseDate(closeDateStr);
                    if (parsed && parsed.endOfDay < startOfToday) {
                        return false; // Close date expired before today
                    }
                }

                return true;
            });

            // Step 2: Sort deals with today's closing deals prioritized at the top
            deals = [...deals].sort((a, b) => {
                const aDateStr = a.timeline_ipo_close_date || a.bidding_end_date || a.close_date;
                const bDateStr = b.timeline_ipo_close_date || b.bidding_end_date || b.close_date;

                const aParsed = parseCloseDate(aDateStr);
                const bParsed = parseCloseDate(bDateStr);

                const aIsToday = isToday(aParsed);
                const bIsToday = isToday(bParsed);

                // Priority 1: Deals closing TODAY come at the very top
                if (aIsToday && !bIsToday) return -1;
                if (!aIsToday && bIsToday) return 1;

                // Priority 2: Sort upcoming deals in ascending order (nearest closing date first)
                const aTime = aParsed ? aParsed.startOfDay : null;
                const bTime = bParsed ? bParsed.startOfDay : null;

                const aHasDate = aTime !== null;
                const bHasDate = bTime !== null;

                if (aHasDate && bHasDate) {
                    if (aTime !== bTime) return aTime - bTime;
                } else if (aHasDate) {
                    return -1;
                } else if (bHasDate) {
                    return 1;
                }

                // Priority 3: Secondary sort by creation date (newest first)
                const aCreated = new Date(a.createdAt || a.created_at || 0).getTime();
                const bCreated = new Date(b.createdAt || b.created_at || 0).getTime();
                return bCreated - aCreated;
            });
        } else if (sortBy === 'most_viewed') {
            // Sort by views / user visits in descending order
            deals = [...deals].sort((a, b) => {
                const aViews = parseFloat(a.user_visited_count ?? a.views ?? a.visit_count ?? 0) || 0;
                const bViews = parseFloat(b.user_visited_count ?? b.views ?? b.visit_count ?? 0) || 0;
                return bViews - aViews;
            });
        } else if (sortBy === 'high_conviction') {
            // Filter exclusively for deals marked as High Conviction, then sort by newest first
            deals = deals.filter(deal =>
                deal.hight_conviction === true ||
                deal.hight_conviction === "true" ||
                deal.high_conviction === true ||
                deal.high_conviction === "true"
            );
            deals = [...deals].sort((a, b) => {
                const aTime = new Date(a.createdAt || a.created_at || 0).getTime();
                const bTime = new Date(b.createdAt || b.created_at || 0).getTime();
                return bTime - aTime;
            });
        } else {
            // Default: "latest" (sort by createdAt descending, newest deals first)
            deals = [...deals].sort((a, b) => {
                const aTime = new Date(a.createdAt || a.created_at || 0).getTime();
                const bTime = new Date(b.createdAt || b.created_at || 0).getTime();
                return bTime - aTime;
            });
        }

        return deals;
    }, [allDeals, selectedDealType, appliedFilters, companySearch, selectedTags, sortBy]);

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

    // Q&A counts and replies are now lazily loaded per visible card via CardFooter's Viewport IntersectionObserver

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



    const isFirstRender = useRef(true);

    useEffect(() => {
        if (initialDeals && initialDeals.length > 0) {
            setAllDeals(initialDeals);
            setLoading(false);
        }
    }, [initialDeals]);

    const fetchDeals = async (
        dealType = selectedDealType,
        search = companySearch,
        tags = selectedTags,
        sectors = appliedFilters?.sectors
    ) => {
        try {
            setLoading(true);
            setError(null);
            const token = Cookies.get('accessToken');

            let dealTypeQuery = "";
            const t = (dealType || "").toLowerCase();
            if (t === "unlisted") {
                dealTypeQuery = "deal_type=unlisted";
            } else if (t === "upcoming" || t === "public" || t === "ipo") {
                dealTypeQuery = "deal_type=public";
            } else if (t === "private") {
                dealTypeQuery = "deal_type=[private,ofs,ccps]";
            } else if (t === "startup") {
                dealTypeQuery = "deal_type=[startup]";
            } else if (t === "all" || !t) {
                dealTypeQuery = "deal_type=[unlisted,public]";
            }

            let queryString = `?page=1&limit=500&${dealTypeQuery}`;

            if (search && search.trim()) {
                queryString += `&search=${encodeURIComponent(search.trim())}`;
            }

            const cleanTags = Array.isArray(tags) ? tags.map(item => String(item).trim()).filter(Boolean) : [];
            if (cleanTags.length > 0) {
                queryString += `&tags=${encodeURIComponent(cleanTags.join(','))}`;
            }

            const cleanSectors = Array.isArray(sectors) ? sectors.map(item => String(item).trim()).filter(Boolean) : [];
            if (cleanSectors.length > 0) {
                queryString += `&companies_sectors=${encodeURIComponent(cleanSectors.join(','))}`;
            }

            const rawBaseUrl = process.env.NEXT_PUBLIC_USER_BASE || "https://api.preqt.club/";
            const baseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl : `${rawBaseUrl}/`;

            const res = await fetch(
                `${baseUrl}admin/api/deals/all-deals/${queryString}`,
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
            setAllDeals(deals);
        } catch (err) {
            console.error("Fetch error in AllDeals:", err);
            setError(err.message || "Failed to fetch deals");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isFirstRender.current) return;
        const timer = setTimeout(() => {
            fetchDeals(selectedDealType, companySearch, selectedTags, appliedFilters?.sectors);
        }, 350);

        return () => clearTimeout(timer);
    }, [companySearch]);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            const hasTags = selectedTags && selectedTags.length > 0;
            const hasSectors = appliedFilters?.sectors && appliedFilters.sectors.length > 0;
            if (initialDeals && initialDeals.length > 0 && !companySearch && !hasTags && !hasSectors) {
                return; // Already pre-fetched via SSR
            }
            fetchDeals(selectedDealType, companySearch, selectedTags, appliedFilters?.sectors);
            return;
        }

        fetchDeals(selectedDealType, companySearch, selectedTags, appliedFilters?.sectors);
    }, [selectedDealType, selectedTags, appliedFilters?.sectors]);


    return (
        <>
            <div className={styles.AllDealsMainContainer}>
                <section className={`${styles.DealsTalkMainContainer} ${stylesdeals.DealsTalkMainContainer} ${appliedFilters ? stylesdeals.filtersActive : ""}`} >
                    <div className={`${stylesdeals.allDealsHeaderRow} ${appliedFilters ? stylesdeals.filtersActive : ""}`}>
                        <div className={stylesdeals.pageHeader}>
                            <div className={stylesdeals.backButtonHeader} onClick={() => router.push('/')}>
                                <span className={stylesdeals.backArrow}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="15 18 9 12 15 6"></polyline>
                                    </svg>
                                </span>
                                <h1 className={stylesdeals.mobileDealsTitle}>Deals</h1>
                            </div>
                            <h1 className={stylesdeals.desktopTitle}>Invest Opportunities</h1>
                            <p className={stylesdeals.desktopSubtitle}>Browse through institutional-grade private equity, SME IPOs, and<br />unlisted shares. Verified data for sophisticated capital.</p>
                        </div>

                        <div className={stylesdeals.filterBarRow}>
                            {/* Row 1: Filter button + View Toggle + Deal Type Dropdown (Mobile) / Full Desktop Row */}
                            <div className={stylesdeals.filterRowTop}>
                                <button className={stylesdeals.desktopFilterBtn} onClick={() => setShowFilterPopup(!showFilterPopup)} title="Filters">
                                    <SlidersHorizontal size={18} />
                                </button>

                                {/* Static Pill Tabs for Deal Types (Desktop only) */}
                                <div className={stylesdeals.dealTypeTabs}>
                                    {dealTypeTabs.map(tab => (
                                        <div
                                            key={tab.value}
                                            className={`${stylesdeals.tabItem} ${selectedDealType === tab.value ? stylesdeals.activeTab : ""}`}
                                            onClick={() => handleTabSelect(tab)}
                                        >
                                            {tab.label}
                                        </div>
                                    ))}
                                </div>

                                {/* Search Company Input (Desktop only) */}
                                <div className={`${stylesdeals.companySearchContainer} ${stylesdeals.desktopOnly}`}>
                                    <Search size={16} className={stylesdeals.companySearchIcon} />
                                    <input
                                        type="text"
                                        placeholder="Search company"
                                        value={companySearch}
                                        onChange={(e) => setCompanySearch(e.target.value)}
                                        className={stylesdeals.companySearchInput}
                                    />
                                    {companySearch && (
                                        <button
                                            type="button"
                                            onClick={() => setCompanySearch("")}
                                            className={stylesdeals.companySearchClear}
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>

                                <div className={stylesdeals.headerActions} ref={dropdownRef}>
                                    {/* Sort by Dropdown (Desktop only) */}
                                    <div className={`${stylesdeals.sortDropdownContainer} ${stylesdeals.desktopOnly}`} ref={sortDropdownRef}>
                                        <button
                                            type="button"
                                            className={stylesdeals.sortDropdownBtn}
                                            onClick={() => setShowSortDropdown(!showSortDropdown)}
                                        >
                                            <span className={stylesdeals.sortLabelText}>
                                                Sort by: {sortOptions.find(o => o.value === sortBy)?.label || "Latest"}
                                            </span>
                                            <ChevronDown size={14} strokeWidth={2.8} className={`${stylesdeals.sortChevron} ${showSortDropdown ? stylesdeals.sortChevronActive : ""}`} />
                                        </button>

                                        {showSortDropdown && (
                                            <div className={stylesdeals.sortDropdownMenu}>
                                                {sortOptions.map(option => {
                                                    const isSelected = sortBy === option.value;
                                                    return (
                                                        <div
                                                            key={option.value}
                                                            className={`${stylesdeals.sortDropdownItem} ${isSelected ? stylesdeals.sortDropdownItemActive : ""}`}
                                                            onClick={() => {
                                                                setSortBy(option.value);
                                                                setShowSortDropdown(false);
                                                            }}
                                                        >
                                                            <span>{option.label}</span>
                                                            {isSelected && (
                                                                <Check size={16} className={stylesdeals.sortCheckIcon} strokeWidth={2.5} />
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* View Toggle */}
                                    <div className={stylesdeals.viewToggle}>
                                        <div className={`${stylesdeals.toggleSlider} ${viewType === 'list' ? stylesdeals.slideRight : ''}`} />
                                        <div
                                            className={`${stylesdeals.toggleIcon} ${viewType === 'grid' ? stylesdeals.active : ""}`}
                                            onClick={() => setViewType('grid')}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke={viewType === 'grid' ? '#96785f' : '#aba99b'}
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <rect width="7" height="7" x="3" y="3" rx="1" />
                                                <rect width="7" height="7" x="14" y="3" rx="1" />
                                                <rect width="7" height="7" x="14" y="14" rx="1" />
                                                <rect width="7" height="7" x="3" y="14" rx="1" />
                                            </svg>
                                        </div>
                                        <div
                                            className={`${stylesdeals.toggleIcon} ${viewType === 'list' ? stylesdeals.active : ""}`}
                                            onClick={() => setViewType('list')}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke={viewType === 'list' ? '#96785f' : '#aba99b'}
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M3 5h.01" />
                                                <path d="M3 12h.01" />
                                                <path d="M3 19h.01" />
                                                <path d="M8 5h13" />
                                                <path d="M8 12h13" />
                                                <path d="M8 19h13" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Mobile Deal Type Dropdown (visible <= 768px) */}
                                    <div className={`${stylesdeals.dealTypeDropdownContainer} ${stylesdeals.mobileOnly}`}>
                                        <button
                                            className={`${stylesdeals.dealTypeDropdownBtn} ${showDealTypeDropdown ? stylesdeals.activeBtn : ""}`}
                                            onClick={() => setShowDealTypeDropdown(!showDealTypeDropdown)}
                                        >
                                            <span>
                                                {selectedDealType === "All" ? "All Deals" :
                                                    dealTypeTabs.find(t => t.value === selectedDealType)?.label || "All Deals"}
                                            </span>
                                            <ChevronDown size={14} className={`${stylesdeals.chevronIcon} ${showDealTypeDropdown ? stylesdeals.chevronIconActive : ""}`} />
                                        </button>

                                        <div className={`${stylesdeals.dealTypeDropdownMenu} ${showDealTypeDropdown ? stylesdeals.dropdownOpen : ""}`}>
                                            {dealTypeTabs.map(tab => (
                                                <div
                                                    key={tab.value}
                                                    className={`${stylesdeals.dropdownItem} ${selectedDealType === tab.value ? stylesdeals.dropdownItemActive : ""}`}
                                                    onClick={() => {
                                                        handleTabSelect(tab);
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

                            {/* Row 2 on mobile (Search company + Sort by) */}
                            <div className={stylesdeals.mobileSearchAndSortRow}>
                                <div className={stylesdeals.companySearchContainer}>
                                    <Search size={16} className={stylesdeals.companySearchIcon} />
                                    <input
                                        type="text"
                                        placeholder="Search company"
                                        value={companySearch}
                                        onChange={(e) => setCompanySearch(e.target.value)}
                                        className={stylesdeals.companySearchInput}
                                    />
                                    {companySearch && (
                                        <button
                                            type="button"
                                            onClick={() => setCompanySearch("")}
                                            className={stylesdeals.companySearchClear}
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>

                                <div className={stylesdeals.sortDropdownContainer} ref={mobileSortDropdownRef}>
                                    <button
                                        type="button"
                                        className={stylesdeals.sortDropdownBtn}
                                        onClick={() => setShowSortDropdown(!showSortDropdown)}
                                    >
                                        <span className={stylesdeals.sortLabelText}>
                                            Sort by: {sortOptions.find(o => o.value === sortBy)?.label || "Latest"}
                                        </span>
                                        <ChevronDown size={14} strokeWidth={2.8} className={`${stylesdeals.sortChevron} ${showSortDropdown ? stylesdeals.sortChevronActive : ""}`} />
                                    </button>

                                    {showSortDropdown && (
                                        <div className={stylesdeals.sortDropdownMenu}>
                                            {sortOptions.map(option => {
                                                const isSelected = sortBy === option.value;
                                                return (
                                                    <div
                                                        key={option.value}
                                                        className={`${stylesdeals.sortDropdownItem} ${isSelected ? stylesdeals.sortDropdownItemActive : ""}`}
                                                        onClick={() => {
                                                            setSortBy(option.value);
                                                            setShowSortDropdown(false);
                                                        }}
                                                    >
                                                        <span>{option.label}</span>
                                                        {isSelected && (
                                                            <Check size={16} className={stylesdeals.sortCheckIcon} strokeWidth={2.5} />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Search & Add Tags Bar Row (Row 3 & Row 4 on mobile) - Only visible when tag(s) selected */}
                        {selectedTags.length > 0 && (
                            <div className={stylesdeals.tagsFilterRow}>
                                <div className={stylesdeals.tagSearchContainer} ref={tagDropdownRef}>
                                    <Search size={15} className={stylesdeals.tagSearchIcon} />
                                    <input
                                        type="text"
                                        placeholder="Search and add tags..."
                                        value={tagSearch}
                                        onChange={(e) => {
                                            setTagSearch(e.target.value);
                                            setShowTagDropdown(true);
                                        }}
                                        onFocus={() => setShowTagDropdown(true)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && tagSearch.trim()) {
                                                e.preventDefault();
                                                handleAddTag(tagSearch.trim());
                                            }
                                        }}
                                        className={stylesdeals.tagSearchInput}
                                    />
                                    {showTagDropdown && suggestedTags.length > 0 && (
                                        <div className={stylesdeals.tagDropdownMenu}>
                                            {suggestedTags.slice(0, 10).map(tag => (
                                                <div
                                                    key={tag}
                                                    className={stylesdeals.tagDropdownItem}
                                                    onClick={() => handleAddTag(tag)}
                                                >
                                                    <span>{tag}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Selected Active Tag Pills & Clear All (Row 4 on mobile) */}
                                <div className={stylesdeals.selectedTagsRowWrapper}>
                                    <div className={stylesdeals.selectedTagsContainer}>
                                        {selectedTags.map(tag => (
                                            <div key={tag} className={stylesdeals.selectedTagPill}>
                                                <span>{tag}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveTag(tag)}
                                                    className={stylesdeals.removeTagBtn}
                                                    aria-label={`Remove tag ${tag}`}
                                                >
                                                    <X size={11} strokeWidth={2.5} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Clear All button */}
                                    {selectedTags.length > 0 && (
                                        <button
                                            type="button"
                                            className={stylesdeals.clearAllTagsBtn}
                                            onClick={handleClearAllTags}
                                        >
                                            Clear All
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
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
                                <div className={`row g-0 ${styles.dealsRow} ${stylesdeals.dealsRow} ${viewType === 'list' ? stylesdeals.listView : ""}`}>
                                    {loading ? (
                                        [...Array(8)].map((_, i) => (
                                            <div
                                                key={`skeleton-${i}`}
                                                className={`${viewType === 'grid' ? 'col-lg-3' : 'col-lg-12'} col-md-6 col-sm-12 ${stylesdeals.dealCardCol} ${viewType === 'list' ? stylesdeals.listViewCol : ""}`}
                                            >
                                                <div className={`${stylesdeals.skeletonCard} ${viewType === 'list' ? stylesdeals.skeletonCardList : ""}`} />
                                            </div>
                                        ))
                                    ) : dealsToRender && dealsToRender.length > 0 ? (
                                        <>
                                            {dealsToRender.map((deal) => (
                                                <div
                                                    key={deal.id}
                                                    className={`${viewType === 'grid' ? 'col-lg-3' : 'col-lg-12'} col-md-6 col-sm-12 ${stylesdeals.dealCardCol} ${viewType === 'list' ? stylesdeals.listViewCol : ""}`}
                                                >
                                                    <DealCard
                                                        deal={deal}
                                                        isAuthenticated={!!authToken}
                                                        onLoginClick={handleSigninOpen}
                                                        isListView={viewType === 'list'}
                                                        ignoreFeatured={true}
                                                        onTagClick={handleAddTag}
                                                    />
                                                </div>
                                            ))}
                                            {viewType === 'grid' && selectedDealType === "All" && (
                                                <div className={`col-lg-3 col-md-6 col-sm-12 ${stylesdeals.dealCardCol}`}>
                                                    <UnlockTeaser isGridCard={true} isAllDeals={true} />
                                                </div>
                                            )}
                                            {viewType === 'list'&& selectedDealType === "All"  && (
                                                <div className="col-lg-12 col-md-12 col-sm-12 px-0" style={{ width: "100%", marginTop: "0px" }}>
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
                        </>
                    )}
                    {((selectedDealType || '').toLowerCase() === "public" || (selectedDealType || '').toLowerCase() === "upcoming") && (
                        <div className={stylesdeals.disclaimerText}>
                            <svg width="12" height="12" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg" className={stylesdeals.cautionIcon}>
                                <path d="M7.134 0.884C7.519 0.217 8.481 0.217 8.866 0.884L15.361 12.134C15.746 12.801 15.265 13.632 14.495 13.632H1.505C0.735 13.632 0.254 12.801 0.639 12.134L7.134 0.884Z" fill="#8C7333"/>
                                <path d="M7.25 4.5H8.75L8.4 8.5H7.6L7.25 4.5Z" fill="#FFFFFF"/>
                                <circle cx="8" cy="10.6" r="0.9" fill="#FFFFFF"/>
                            </svg>
                            <span>Grey Market Premium (GMPs) are shared for knowledge purpose only. PrEqt doesn’t promote or execute the trades.</span>
                        </div>
                    )}
                    {(selectedDealType || '').toLowerCase() === "unlisted" && (
                        <div className={stylesdeals.disclaimerText}>
                            <svg width="12" height="12" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg" className={stylesdeals.cautionIcon}>
                                <path d="M7.134 0.884C7.519 0.217 8.481 0.217 8.866 0.884L15.361 12.134C15.746 12.801 15.265 13.632 14.495 13.632H1.505C0.735 13.632 0.254 12.801 0.639 12.134L7.134 0.884Z" fill="#8C7333"/>
                                <path d="M7.25 4.5H8.75L8.4 8.5H7.6L7.25 4.5Z" fill="#FFFFFF"/>
                                <circle cx="8" cy="10.6" r="0.9" fill="#FFFFFF"/>
                            </svg>
                            <span>Disclaimer: Unlisted shares are unregulated & illiquid. This is NOT investment advice. Please do your own due diligence before investing.</span>
                        </div>
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
                    redirectTo={redirectPath}
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


export default function AllDeals({ initialDeals = [], initialPagination = {}, initialCategory = null }) {
    return (
        <Suspense fallback={<Loader />}>
            <AllDealsContent initialDeals={initialDeals} initialPagination={initialPagination} initialCategory={initialCategory} />
        </Suspense>
    );
} 
