import React, { useState, useEffect, useRef } from "react";
import { Modal } from "react-bootstrap";
import { X } from "lucide-react";
import styles from "./FilterPopup.module.css";
import Image from "next/image";

const formatNumberWithCommas = (num) => {
    if (num === null || num === undefined) return "";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Dual Slider Component moved outside to prevent React from unmounting it
const DualSlider = ({ values, setValues, minVal = 0, maxVal = 10, formatLabel }) => {
    const trackRef = useRef(null);
    const isDraggingRef = useRef(false);
    const activeHandleRef = useRef(null);

    const [activeThumb, setActiveThumb] = useState(null);

    const range = maxVal - minVal || 1; // Prevent division by zero

    const valuesRef = useRef(values);
    useEffect(() => {
        valuesRef.current = values;
    }, [values]);

    const handlePointerMove = (e) => {
        if (!isDraggingRef.current || !trackRef.current) return;
        const rect = trackRef.current.getBoundingClientRect();
        let percent = (e.clientX - rect.left) / rect.width;
        percent = Math.max(0, Math.min(1, percent));
        let val = Math.round((percent * range + minVal) * 2) / 2; // Step of 0.5

        const currentVals = valuesRef.current;
        if (activeHandleRef.current === "min") {
            setValues([Math.min(val, currentVals[1]), currentVals[1]]);
        } else if (activeHandleRef.current === "max") {
            setValues([currentVals[0], Math.max(val, currentVals[0])]);
        }
    };

    const handlePointerUp = () => {
        isDraggingRef.current = false;
        activeHandleRef.current = null;
        setActiveThumb(null);
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('pointercancel', handlePointerUp);
    };

    const handlePointerDown = (e, handle) => {
        e.stopPropagation();
        e.preventDefault();
        isDraggingRef.current = true;
        activeHandleRef.current = handle;
        setActiveThumb(handle);

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
        window.addEventListener('pointercancel', handlePointerUp);
    };

    useEffect(() => {
        return () => handlePointerUp();
    }, []);

    const handleTrackClick = (e) => {
        if (!trackRef.current || isDraggingRef.current) return;
        const rect = trackRef.current.getBoundingClientRect();
        let percent = (e.clientX - rect.left) / rect.width;
        percent = Math.max(0, Math.min(1, percent));
        let val = Math.round((percent * range + minVal) * 2) / 2;

        if (Math.abs(val - values[0]) <= Math.abs(val - values[1])) {
            setValues([val, values[1]]);
        } else {
            setValues([values[0], val]);
        }
    };

    const leftPercent = ((values[0] - minVal) / range) * 100;
    const widthPercent = ((values[1] - values[0]) / range) * 100;

    return (
        <div style={{ touchAction: 'none' }}>
            <div className={styles.sliderMinMax}>
                {formatLabel(values[0], values[1])}
            </div>
            <div className={styles.sliderTrack} ref={trackRef} onClick={handleTrackClick}>
                <div
                    className={styles.sliderSelected}
                    style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
                />
                <div
                    className={styles.sliderThumb}
                    style={{ left: `${leftPercent}%`, zIndex: activeThumb === 'min' ? 10 : 2 }}
                    onPointerDown={(e) => handlePointerDown(e, 'min')}
                />
                <div
                    className={styles.sliderThumb}
                    style={{ left: `${leftPercent + widthPercent}%`, zIndex: activeThumb === 'max' ? 10 : 2 }}
                    onPointerDown={(e) => handlePointerDown(e, 'max')}
                />
            </div>
            <div className={styles.sliderLabels}>
                <span>₹{formatNumberWithCommas(minVal)} Cr</span>
                <span>₹{formatNumberWithCommas(Math.round(minVal + range * 0.33))} Cr</span>
                <span>₹{formatNumberWithCommas(Math.round(minVal + range * 0.66))} Cr</span>
                <span>₹{formatNumberWithCommas(maxVal)} Cr+</span>
            </div>
        </div>
    );
};

const FilterPopup = ({ 
    show, 
    onHide, 
    onApply, 
    availableStages = [], 
    revenueRange = { min: 0, max: 100 },
    valuationRange: valuationRangeProp = { min: 0, max: 10000 },
    availableActivities = [],
    availableParticipations = [],
    availableSectors = [],
    initialFilters = null 
}) => {
    // State for all filters
    const [dealStages, setDealStages] = useState([]);

    // Use dynamic stages if available, otherwise fallback to design defaults
    const stageOptions = availableStages.length > 0
        ? availableStages
        : ["IPO – SME", "IPO – Mainboard", "Pre-IPO – SME", "Pre-IPO – Mainboard"];
    const [sectors, setSectors] = useState([]);
    const [searchSector, setSearchSector] = useState("");
    const [dealRatings, setDealRatings] = useState([]);
    const [ticketSize, setTicketSize] = useState([revenueRange.min, revenueRange.max]); // In Cr
    
    // Sync ticketSize with revenueRange when it updates
    useEffect(() => {
        setTicketSize([revenueRange.min, revenueRange.max]);
    }, [revenueRange]);

    const [fundingStatus, setFundingStatus] = useState([]);
    const [valuationRange, setValuationRange] = useState([valuationRangeProp.min, valuationRangeProp.max]); // In Cr

    // Sync valuationRange with valuationRangeProp when it updates
    useEffect(() => {
        setValuationRange([valuationRangeProp.min, valuationRangeProp.max]);
    }, [valuationRangeProp]);
    const [activities, setActivities] = useState([]);
    const [participation, setParticipation] = useState([]);

    // 2. Synchronize local state with active filters when modal opens
    useEffect(() => {
        if (show) {
            if (initialFilters) {
                setDealStages(initialFilters.dealStages || []);
                setSectors(initialFilters.sectors || []);
                setDealRatings(initialFilters.dealRatings || []);
                setTicketSize(initialFilters.ticketSize || [revenueRange.min, revenueRange.max]);
                setFundingStatus(initialFilters.fundingStatus || []);
                setValuationRange(initialFilters.valuationRange || [valuationRangeProp.min, valuationRangeProp.max]);
                setActivities(initialFilters.activities || []);
                setParticipation(initialFilters.participation || []);
            } else {
                // If no filters applied, reset to defaults
                setDealStages([]);
                setSectors([]);
                setSearchSector("");
                setDealRatings([]);
                setTicketSize([revenueRange.min, revenueRange.max]);
                setFundingStatus([]);
                setValuationRange([valuationRangeProp.min, valuationRangeProp.max]);
                setActivities([]);
                setParticipation([]);
            }
        }
    }, [show, initialFilters, revenueRange.min, revenueRange.max, valuationRangeProp.min, valuationRangeProp.max]);

    const toggleArrayItem = (array, setArray, item) => {
        if (array.includes(item)) {
            setArray(array.filter((i) => i !== item));
        } else {
            setArray([...array, item]);
        }
    };

    const handleClearAll = () => {
        setDealStages([]);
        setSectors([]);
        setSearchSector("");
        setDealRatings([]);
        setTicketSize([revenueRange.min, revenueRange.max]);
        setFundingStatus([]);
        setValuationRange([valuationRangeProp.min, valuationRangeProp.max]);
        setActivities([]);
        setParticipation([]);
    };

    const handleResetAndApply = () => {
        handleClearAll();
        onApply(null); // Passing null clears filters in AllDeals.jsx
        onHide();
    };

    const handleApply = () => {
        const filters = {};

        if (dealStages.length > 0) filters.dealStages = dealStages;
        if (sectors.length > 0) filters.sectors = sectors;
        if (dealRatings.length > 0) filters.dealRatings = dealRatings;
        if (fundingStatus.length > 0) filters.fundingStatus = fundingStatus;
        if (activities.length > 0) filters.activities = activities;
        if (participation.length > 0) filters.participation = participation;

        // Only include range filters if they've been moved from default
        if (ticketSize[0] !== revenueRange.min || ticketSize[1] !== revenueRange.max) {
            filters.ticketSize = ticketSize;
        }
        if (valuationRange[0] !== valuationRangeProp.min || valuationRange[1] !== valuationRangeProp.max) {
            filters.valuationRange = valuationRange;
        }

        const hasFilters = Object.keys(filters).length > 0;
        onApply(hasFilters ? filters : null);
        onHide();
    };

    const Checkbox = ({ label, checked, onChange }) => (
        <label className={styles.checkboxLabel}>
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className={styles.checkboxInput}
            />
            <div className={styles.customCheckbox}>
                {checked && <img src="/tickCheckbox.svg" alt="tick" className={styles.tickIcon} />}
            </div>
            <span className={styles.checkboxLabelText}>{label}</span>
        </label>
    );

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            dialogClassName={styles.modalDialog}
            contentClassName={styles.modalContent}
            backdrop="static"
        >
            <div className={styles.modalHeader}>
                <h2 className={styles.title}>Filters</h2>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <button onClick={handleClearAll} className={styles.clearAllBtn}>
                        Clear All
                    </button>
                    <X size={24} color="#4A5565" cursor="pointer" onClick={onHide} />
                </div>
            </div>

            <div className={styles.modalBody}>
                {/* 1. Deal Stage */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Deal Stage</h3>
                    <div className={styles.checkboxContainer}>
                        {(() => {
                            const formatStageLabel = (stage) => {
                                if (!stage) return "";
                                if (stage.toLowerCase() === "sme") return "SME";
                                if (stage.toLowerCase() === "pre ipo") return "Pre-IPO";
                                return stage.charAt(0).toUpperCase() + stage.slice(1);
                            };

                            return stageOptions.map(lbl => (
                                <Checkbox
                                    key={lbl}
                                    label={formatStageLabel(lbl)}
                                    checked={dealStages.includes(lbl)}
                                    onChange={() => toggleArrayItem(dealStages, setDealStages, lbl)}
                                />
                            ));
                        })()}
                    </div>
                </div>

                {/* 2. Sector / Industry */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Sector / Industry</h3>
                    <div className={styles.searchInputWrapper}>
                        <input
                            type="text"
                            placeholder="Search sectors..."
                            value={searchSector}
                            onChange={(e) => setSearchSector(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                    <div className={styles.checkboxContainerThreeCols}>
                        {(availableSectors.length > 0 ? availableSectors : ["Healthcare", "Fintech", "Others", "Electrical Engineering", "SaaS", "EV / Infrastructure", "Consumer", "Manufacturing", "Energy"])
                            .filter(s => s.toLowerCase().includes(searchSector.toLowerCase()))
                            .map(lbl => (
                                <Checkbox
                                    key={lbl}
                                    label={lbl}
                                    checked={sectors.includes(lbl)}
                                    onChange={() => toggleArrayItem(sectors, setSectors, lbl)}
                                />
                            ))}
                    </div>
                </div>

                {/* 3. Deal Rating */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Deal Rating</h3>
                    <div className={styles.pillGroup}>
                        {["4.5 & above", "4.0 – 4.5", "Below 4.0"].map(lbl => {
                            const isActive = dealRatings.includes(lbl);
                            return (
                                <div
                                    key={lbl}
                                    className={`${styles.pillBtn} ${isActive ? styles.pillBtnActive : ''}`}
                                    onClick={() => toggleArrayItem(dealRatings, setDealRatings, lbl)}
                                >
                                    {isActive ? (
                                        <img src="/starwhite.svg" className={styles.activeStar} alt="star" />
                                    ) : (
                                        <div className={styles.inactiveStar} aria-label="star" />
                                    )}
                                    <p className={styles.pillLabel}>{lbl}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 4. Ticket Size / Allocation */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Ticket Size / Allocation</h3>
                    <DualSlider
                        values={ticketSize}
                        setValues={setTicketSize}
                        minVal={revenueRange.min}
                        maxVal={revenueRange.max}
                        formatLabel={(min, max) => `₹${formatNumberWithCommas(min)} Cr – ₹${formatNumberWithCommas(max)} Cr`}
                    />
                </div>

                {/* 5. Funding Status */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Funding Status</h3>
                    <div className={styles.checkboxContainer}>
                        {["< 50% Funded", "80%+ Funded", "50% – 80% Funded"].map(lbl => (
                            <Checkbox
                                key={lbl}
                                label={lbl}
                                checked={fundingStatus.includes(lbl)}
                                onChange={() => toggleArrayItem(fundingStatus, setFundingStatus, lbl)}
                            />
                        ))}
                    </div>
                </div>

                {/* 6. Valuation Range */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Valuation Range</h3>
                    <DualSlider
                        values={valuationRange}
                        setValues={setValuationRange}
                        minVal={valuationRangeProp.min}
                        maxVal={valuationRangeProp.max}
                        formatLabel={(min, max) => `₹${formatNumberWithCommas(min)} Cr – ₹${formatNumberWithCommas(max)} Cr`}
                    />
                </div>

                {/* 7. Activity & Freshness */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Activity & Freshness</h3>
                    <div className={styles.pillGroup}>
                        {(availableActivities.length > 0 ? availableActivities : ["New Deals", "Trending Deals", "Most Viewed", "Recently Updated"]).map(lbl => (
                            <div
                                key={lbl}
                                className={`${styles.pillBtn} ${activities.includes(lbl) ? styles.pillBtnActive : ''}`}
                                onClick={() => toggleArrayItem(activities, setActivities, lbl)}
                            >
                                <p className={styles.pillLabel}>{lbl}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 8. Participation & Validation */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Participation & Validation</h3>
                    <div className={styles.checkboxContainer}>
                        {(availableParticipations.length > 0 ? availableParticipations : ["Merchant Banker Appointed", "Anchor / Strategic Investors", "Institutional / Fund Participation", "Strong Promoter Background"]).map(lbl => (
                            <Checkbox
                                key={lbl}
                                label={lbl}
                                checked={participation.includes(lbl)}
                                onChange={() => toggleArrayItem(participation, setParticipation, lbl)}
                            />
                        ))}
                    </div>
                </div>

            </div>

            <div className={styles.modalFooter}>
                <button className={styles.btnReset} onClick={handleResetAndApply}>
                    Reset
                </button>
                <button className={styles.btnApply} onClick={handleApply}>
                    Apply Filters
                </button>
            </div>
        </Modal>
    );
};

export default FilterPopup;
