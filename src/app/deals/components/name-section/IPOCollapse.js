import { ChevronDown, ChevronUp, TrendingUp } from "lucide-react";
import React, { useState } from "react";
import { Collapse, Table, OverlayTrigger, Tooltip } from "react-bootstrap";
import styles from './IPOCollapse.module.css'
import { useDealStore } from "@/store/dealStore";

const IPOCollapse = ({ isPrivateDeal, isccps, isofs }) => {
    const [open, setOpen] = useState(true);


    const dealDetails = useDealStore((state) => state.dealDetails);
    const dealData = dealDetails?.data?.deal_setpData;

    const formatNumber = (value) => {
        if (value === null || value === undefined || isNaN(Number(value))) return value ?? "-";
        return Number(value).toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    };

    const [isSmallScreen, setIsSmallScreen] = React.useState(false);
    React.useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth < 920);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const shouldShowTooltip = (tooltip) => {
        if (!tooltip) return false;
        if (typeof tooltip === "string") return tooltip.trim() !== "";
        return tooltip?.status === true && !!tooltip?.data?.trim();
    };

    const renderTooltip = (text) => (props) => (
        <Tooltip id="button-tooltip" {...props} className={styles.customTooltip}>
            {typeof text === 'object' && text !== null ? text.data : text}
        </Tooltip>
    );

    return (
        <div className={`${isPrivateDeal ? styles.privateipo : ''} ${styles.ipocllapseWrapper || ''}`}>
            <button
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                className={styles.ipocollapseBtn}
            >
                <div className={styles.ipocollapseleft}>
                    <small className={styles.smallText}>
                        {isccps && dealData?.price_per_ccps?.status
                            ? (dealData?.price_per_ccps?.label_name || "Price per CCPS")
                            : (dealData?.issue_price_per_share?.label_name || "Issue Price")
                        }
                        {shouldShowTooltip(isccps && dealData?.price_per_ccps?.status ? dealData?.price_per_ccps?.tool_tip : dealData?.issue_price_per_share?.tool_tip) && (
                            <OverlayTrigger
                                placement="top-start"
                                container={document.body}
                                delay={{ show: 250, hide: 400 }}
                                overlay={renderTooltip(isccps && dealData?.price_per_ccps?.status ? dealData?.price_per_ccps?.tool_tip : dealData.issue_price_per_share.tool_tip)}
                            >
                                <img src={isPrivateDeal ? "/tooltip.svg" : "/toolTippublic.svg"} alt="tip" className={styles.tooltipIcon} />
                            </OverlayTrigger>
                        )}
                    </small>

                    {dealData?.issue_price_per_share?.status ? (
                        <h5 className={styles.largeText}>
                            {dealData.issue_price_per_share.data?.from === 0 && dealData.issue_price_per_share.data?.to === 0 ? (
                                "TBD"
                            ) : (
                                <>
                                    ₹{Number(dealData.issue_price_per_share.data?.from || 0).toFixed(1)} to ₹{Number(dealData.issue_price_per_share.data?.to || 0).toFixed(1)}
                                </>
                            )}
                        </h5>
                    ) : isPrivateDeal && dealData?.price_per_ccps?.status ? (
                        <h5 className={styles.largeText}>
                            {isccps && dealData?.price_per_ccps?.data === 0 ? (
                                "TBD"
                            ) : (
                                <>
                                    ₹{formatNumber(dealData?.price_per_ccps?.data)}
                                    <small className={styles.smll}> per CCPS</small>
                                </>
                            )}
                        </h5>
                    ) : (
                        dealData?.per_share_price?.status && (
                            <h5 className={styles.largeText}>
                                {dealData?.per_share_price?.data === "0" ? (
                                    "TBD"
                                ) : (
                                    <>
                                        ₹{dealData?.per_share_price?.data}
                                    </>
                                )}
                            </h5>
                        )
                    )}
                </div>

                {!isPrivateDeal && (
                    <>
                        <div className={styles.ipocollapseCenter}>
                            {(dealData?.gmp?.status || true) && (
                                <div className={styles.ipocollapseCenterInner}>
                                    <small className={styles.smallText}>
                                        {dealData?.gmp?.label_name || "Current GMP (Per share)"}
                                        {shouldShowTooltip(dealData?.gmp?.tool_tip) && (
                                            <OverlayTrigger
                                                placement={isSmallScreen ? "top-start" : "top-end"}
                                                container={document.body}
                                                delay={{ show: 250, hide: 400 }}
                                                overlay={renderTooltip(dealData.gmp.tool_tip)}
                                            >
                                                <img src={isPrivateDeal ? "/tooltip.svg" : "/toolTippublic.svg"} alt="tip" className={styles.tooltipIcon} />
                                            </OverlayTrigger>
                                        )}
                                    </small>
                                    <h5 className={styles.largeText}>
                                        {dealData?.gmp?.data ? (
                                            <>₹{formatNumber(dealData?.gmp?.data)}</>
                                        ) : (
                                            "-"
                                        )}
                                    </h5>
                                </div>
                            )}
                        </div>

                        <div className={styles.ipocollapseCenter}>
                            {(dealData?.estimated_gain_loss?.status || true) && (
                                <div className={styles.ipocollapseCenterInner}>
                                    <small className={styles.smallText}>
                                        {dealData?.estimated_gain_loss?.label_name || "Estimated Gain/Loss"}
                                        {shouldShowTooltip(dealData?.estimated_gain_loss?.tool_tip) && (
                                            <OverlayTrigger
                                                placement={isSmallScreen ? "top-start" : "top-end"}
                                                container={document.body}
                                                delay={{ show: 250, hide: 400 }}
                                                overlay={renderTooltip(dealData.estimated_gain_loss.tool_tip)}
                                            >
                                                <img src={isPrivateDeal ? "/tooltip.svg" : "/toolTippublic.svg"} alt="tip" className={styles.tooltipIcon} />
                                            </OverlayTrigger>
                                        )}
                                    </small>
                                    <h5 className={styles.gainTextgreen} style={{ color: Number(dealData?.estimated_gain_loss?.data) < 0 ? 'red' : undefined }}>
                                        {dealData?.estimated_gain_loss?.data !== undefined && dealData?.estimated_gain_loss?.data !== null ? (
                                            <>
                                                {dealData.estimated_gain_loss.data > 0 ? "+" : ""}{dealData.estimated_gain_loss.data}%
                                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: "8px", alignItems: "center", marginBottom: "3px" }}>
                                                    {dealData.estimated_gain_loss.data < 0 ? (
                                                        <path d="M6 1V11M6 11L1 6M6 11L11 6" stroke="red" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    ) : (
                                                        <path d="M6 11V1M6 1L1 6M6 1L11 6" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    )}
                                                </svg>
                                            </>
                                        ) : (
                                            <>
                                                TBD
                                                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: "8px", alignItems: "center", marginBottom: "3px" }}>
                                                    <path d="M6 11V1M6 1L1 6M6 1L11 6" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </>
                                        )}
                                    </h5>
                                </div>
                            )}
                        </div>

                    </>
                )}

                <div className={styles.ipocollapseright}>
                    <div className={styles.ipocollapserightInner}>
                        <small className={styles.smallText}>
                            {dealData?.lot_size?.label_name || "Lot Size"}
                            {shouldShowTooltip(dealData?.lot_size?.tool_tip) && (
                                <OverlayTrigger
                                    placement={isSmallScreen ? "top-start" : "top-end"}
                                    container={document.body}
                                    delay={{ show: 250, hide: 400 }}
                                    overlay={renderTooltip(dealData.lot_size.tool_tip)}
                                >
                                    <img src={isPrivateDeal ? "/tooltip.svg" : "/toolTippublic.svg"} alt="tip" className={styles.tooltipIcon} />
                                </OverlayTrigger>
                            )}
                        </small>
                        {dealData?.lot_size?.status && (
                            <h5 className={styles.largeText}>
                                {formatNumber(dealData?.lot_size?.data) == 0
                                    ? "TBD"
                                    : `${formatNumber(dealData?.lot_size?.data)} Shares`}
                            </h5>
                        )}

                    </div>
                    {!isofs && (open ? <ChevronUp color={isPrivateDeal ? "white" : "black"} /> : <ChevronDown color={isPrivateDeal ? "white" : "black"} />)}
                </div>

            </button>

            <Collapse in={!isofs && open}>
                <div>
                    {dealData?.issue_size?.status && (
                        <Table className={`${styles.ipoCollapsetable} ${isPrivateDeal ? styles.privateTable : ""}`} borderless>
                            <thead>
                                <tr>
                                    <th className="">
                                        {dealData?.issue_size?.label_name || "Issue size"}
                                        {shouldShowTooltip(dealData?.issue_size?.tool_tip) && (
                                            <OverlayTrigger
                                                placement={isSmallScreen ? "top-start" : "top-end"}
                                                container={document.body}
                                                delay={{ show: 250, hide: 400 }}
                                                overlay={renderTooltip(dealData.issue_size.tool_tip)}
                                            >
                                                <img src={isPrivateDeal ? "/tooltip.svg" : "/toolTippublic.svg"} alt="tip" className={styles.tooltipIcon} />
                                            </OverlayTrigger>
                                        )}
                                    </th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="text-start">
                                        {isccps
                                            ? (dealData.issue_size.data.overall?.label_name || "Overall")
                                            : (dealData.issue_size.data.overall?.label_name || "Overall")}
                                    </td>
                                    <td className="text-end">
                                        {isccps
                                            ? (dealData.issue_size.data.overall?.data
                                                ? `₹${formatNumber(dealData?.issue_size.data.overall?.data)} Cr`
                                                : "-")
                                            : (dealData.issue_size.data.overall
                                                ? `₹${formatNumber(dealData?.issue_size?.data?.overall)} Cr`
                                                : "-")}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="text-start">
                                        {isccps
                                            ? (dealData.issue_size.data.fresh_issue?.label_name || "Fresh Issue")
                                            : (dealData.issue_size.data.fresh_issue?.label_name || "Fresh Issue")}
                                    </td>
                                    <td className="text-end">
                                        {isccps
                                            ? (dealData.issue_size.data.fresh_issue?.data
                                                ? `₹${formatNumber(dealData.issue_size.data.fresh_issue.data)} Cr`
                                                : "-")
                                            : (dealData.issue_size.data.fresh_issue
                                                ? `₹${formatNumber(dealData.issue_size.data.fresh_issue)} Cr`
                                                : "-")}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="text-start">
                                        {isccps
                                            ? (dealData.issue_size.data.offer_for_sale?.label_name || "Offer for Sale")
                                            : (dealData.issue_size.data.offer_for_sale?.label_name || "Offer for Sale")}
                                    </td>
                                    <td className="text-end">
                                        {isccps
                                            ? (dealData.issue_size.data.offer_for_sale?.data
                                                ? `₹${formatNumber(dealData.issue_size.data.offer_for_sale.data)} Cr`
                                                : "NIL")
                                            : (dealData.issue_size.data.offer_for_sale
                                                ? `₹${formatNumber(dealData.issue_size.data.offer_for_sale)} Cr`
                                                : "-")}
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                    )}

                </div>
            </Collapse>
        </div>
    );
};

export default IPOCollapse;