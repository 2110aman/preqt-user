import React, { useState, useEffect, useRef, useMemo } from "react";
import { Tab, Tabs, Fade } from "react-bootstrap";
import { useDealStore } from "@/store/dealStore";
import Overview from "./overview/overview";
import Fundamentals from "./fundamentals/fundamentals";
import Keyfinancials from "./keyfinancials/keyfinancials";
import Industry from "./industry/industry";
import Business from "./business/Business";
import Shareholding from "./fundraise/Shareholding";
import Documentation from "./documentation/page";
import "./customnavbar.css";

const Customnavbar = ({ isPrivateDeal, isccps }) => {
  const dealDetails = useDealStore((state) => state.dealDetails);
  const dealData = dealDetails?.data || {};

  const hasOverview = useMemo(() => {
    const dealOverview = dealDetails?.data?.deal_overview;
    if (!dealOverview || dealOverview.status === false) {
      return false;
    }
    return Object.keys(dealOverview).some((key) => {
      if (key === "status") return false;
      const item = dealOverview[key];
      return (
        item &&
        typeof item === "object" &&
        item.status === true &&
        item.data !== null &&
        item.data !== undefined
      );
    });
  }, [dealDetails]);

  const hasBusiness = useMemo(() => {
    const business = dealDetails?.data?.business;
    if (!business) return false;

    // Determine data sources for Products and Services
    const productsObj = business?.products_and_services?.status 
      ? business.products_and_services.data?.products 
      : business?.products;
    const servicesObj = business?.products_and_services?.status 
      ? business.products_and_services.data?.services 
      : business?.services;

    const hasProducts = Array.isArray(productsObj?.data) && productsObj.data.length > 0;
    const hasServices = Array.isArray(servicesObj?.data) && servicesObj.data.length > 0;
    const hasGeo = !!(business?.geographical_presence?.status && business.geographical_presence.data);
    const hasModel = !!(business?.business_model?.status && business.business_model.data);
    const hasChannel = !!(business?.sales_channel?.status && business.sales_channel.data);
    const hasClients = !!(business?.clients?.status && Array.isArray(business.clients.data) && business.clients.data.length > 0);

    return hasProducts || hasServices || hasGeo || hasModel || hasChannel || hasClients;
  }, [dealDetails]);

  const hasFundraise = useMemo(() => {
    const fundraise = dealDetails?.data?.fundraise_future_plans;
    if (!fundraise || fundraise.status === false) return false;

    // 1. Shareholding Pattern check
    const shareholding = fundraise.shareholding_pattern;
    let hasShareholding = false;
    if (shareholding && shareholding.status !== false) {
      const promoters = shareholding?.data?.promoters?.data || shareholding?.promoters?.data;
      const additionals = shareholding?.data?.additional_shareholders?.data || shareholding?.additional_shareholders?.data;
      
      const hasPromoters = Array.isArray(promoters) && promoters.length > 0 && promoters.some(p => p && (p.promoter_name || p.pre_issue_share || p.post_issue_share));
      const hasAdditionals = Array.isArray(additionals) && additionals.length > 0 && additionals.some(a => a && (a.shareholder_name || a.pre_issue_share || a.post_issue_share));
      hasShareholding = hasPromoters || hasAdditionals;
    }

    if (isPrivateDeal) {
      return hasShareholding;
    }

    // 2. IPO Key Highlights check
    const ipoHighlights = fundraise.ipo_key_highlights;
    let hasHighlights = false;
    if (ipoHighlights && ipoHighlights.status !== false) {
      const highlightsData = ipoHighlights.data;
      hasHighlights = Array.isArray(highlightsData) && highlightsData.length > 0 && highlightsData.some(item => {
        const key = Object.keys(item)[0];
        const val = item[key]?.value;
        const desc = item[key]?.description;
        return (val?.status && val?.data != null && val?.data !== "") || (desc?.status && desc?.data != null && desc?.data !== "");
      });
    }

    // 3. IPO Objective check
    const ipoObjective = fundraise.ipo_objective;
    const hasObjective = !!(
      ipoObjective &&
      ipoObjective.status !== false && (
        (ipoObjective.business_expansion?.status && ipoObjective.business_expansion?.data != null && ipoObjective.business_expansion?.data !== "") ||
        (ipoObjective.utilization_of_proceeds?.status && ipoObjective.utilization_of_proceeds?.data != null && ipoObjective.utilization_of_proceeds?.data !== "") ||
        (ipoObjective.capital_expenditure?.status && ipoObjective.capital_expenditure?.data != null && ipoObjective.capital_expenditure?.data !== "") ||
        (ipoObjective.credit_rating_outlook?.status && ipoObjective.credit_rating_outlook?.data != null && ipoObjective.credit_rating_outlook?.data !== "")
      )
    );

    // 4. IPO Notes check
    const ipoNotes = fundraise.ipo_notes;
    const hasNotes = !!(
      ipoNotes &&
      ipoNotes.status !== false && (
        (ipoNotes.risk_factor?.status && ipoNotes.risk_factor?.data != null && ipoNotes.risk_factor?.data !== "") ||
        (ipoNotes.additional_activities?.status && ipoNotes.additional_activities?.data != null && ipoNotes.additional_activities?.data !== "") ||
        (ipoNotes.important_dates?.status && ipoNotes.important_dates?.data != null && ipoNotes.important_dates?.data !== "") ||
        (ipoNotes.additional_notes?.status && ipoNotes.additional_notes?.data != null && ipoNotes.additional_notes?.data !== "")
      )
    );

    return hasShareholding || hasHighlights || hasObjective || hasNotes;
  }, [dealDetails, isPrivateDeal]);

  const availableTabs = useMemo(() => {
    const list = [];
    if (hasOverview) list.push("Overview");
    if (hasBusiness) list.push("Business");
    list.push("Industry Overview");
    list.push("Financial Highlights");
    if (hasFundraise) list.push("Fundraise/Future Plans");
    list.push("Documentation");
    return list;
  }, [hasOverview, hasBusiness, hasFundraise]);

  const [key, setKey] = useState("Overview");

  useEffect(() => {
    if (!availableTabs.includes(key)) {
      setKey(availableTabs[0] || "Overview");
    }
  }, [availableTabs, key]);

  const tabsRef = useRef(null);
  const [firstLoad, setFirstLoad] = useState(true);

  const contentRefs = {
    Overview: useRef(null),
    Business: useRef(null),
    "Industry Overview": useRef(null),
    "Financial Highlights": useRef(null),
    "Fundraise/Future Plans": useRef(null),
    Documentation: useRef(null),
  };

  useEffect(() => {
    if (firstLoad) {
      setFirstLoad(false);
      return
    }
    const activeTab = tabsRef.current?.querySelector(".nav-link.active");
    if (activeTab) {
      activeTab.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }

    const activeContent = contentRefs[key]?.current;
    if (activeContent) {
      const navbarHeight = tabsRef.current?.offsetHeight || 0;
      const topOffset =
        activeContent.getBoundingClientRect().top +
        window.scrollY -
        navbarHeight;

      window.scrollTo({
        top: topOffset,
        behavior: "smooth",
      });
    }
  }, [key]);

  return (
    <div className="first-navbar">
      <Tabs
        id="carousel-tabs"
        ref={tabsRef}
        activeKey={key}
        onSelect={(k) => setKey(k)}
        className="navigation-tabs"
        transition={Fade}
        mountOnEnter
        unmountOnExit
      >
        {hasOverview && (
          <Tab eventKey="Overview" title="Overview">
            <div ref={contentRefs["Overview"]} className="tab-content-wrapper" style={{ minHeight: 'calc(100vh - 150px)' }}>
              <Overview isPrivateDeal={isPrivateDeal} />
            </div>
          </Tab>
        )}

        {hasBusiness && (
          <Tab eventKey="Business" title="Business">
            <div ref={contentRefs["Business"]} className="tab-content-wrapper" style={{ minHeight: 'calc(100vh - 150px)' }}>
              <Business isPrivateDeal={isPrivateDeal} />
            </div>
          </Tab>
        )}

        <Tab eventKey="Industry Overview" title="Industry Overview">
          <div ref={contentRefs["Industry Overview"]} className="tab-content-wrapper" style={{ minHeight: 'calc(100vh - 150px)' }}>
            <Industry isPrivateDeal={isPrivateDeal} />
          </div>
        </Tab>

        <Tab eventKey="Financial Highlights" title="Financial Highlights">
          <div ref={contentRefs["Financial Highlights"]} className="tab-content-wrapper" style={{ minHeight: '100vh' }}>
            <Keyfinancials isPrivateDeal={isPrivateDeal} />
          </div>
        </Tab>

        {hasFundraise && (
          <Tab eventKey="Fundraise/Future Plans" title="Fundraise/Future Plans">
            <div ref={contentRefs["Fundraise/Future Plans"]} className="tab-content-wrapper" style={{ minHeight: 'calc(100vh - 150px)' }}>
              <Shareholding isPrivateDeal={isPrivateDeal} isccps = {isccps}/>
            </div>
          </Tab>
        )}

        <Tab eventKey="Documentation" title="Documentation">
          <div ref={contentRefs["Documentation"]} className="tab-content-wrapper" style={{ minHeight: 'calc(100vh - 150px)' }}>
            <Documentation isPrivateDeal={isPrivateDeal} />
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

export default Customnavbar;