"use client";
import React, { useState, useEffect } from "react";
import styles from "./Business.module.css";
import { ChevronDown } from "lucide-react";
import { Collapse } from "react-bootstrap";
import { useDealStore } from "@/store/dealStore";

// ✅ Reusable SafeImage component
const SafeImage = ({ src, alt, className, style }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || !src) return null;

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={(e) => {
        e.target.onerror = null;
        setIsVisible(false);
      }}
    />
  );
};

// ✅ Dropdown Component
const Dropdown = ({ title, children, isOpen, onToggle, isPrivateDeal }) => (
  <div className={styles.dropdown}>
    <div className={styles.header} onClick={() => onToggle(title)}>
      <h3 className={styles.title}>{title}</h3>
      <span className={`${styles.iconWrapper} ${isOpen ? styles.open : ""}`}>
        <ChevronDown size={24} color={isPrivateDeal ? "white" : "black"} />
      </span>
    </div>

    <Collapse in={isOpen} mountOnEnter unmountOnExit={false}>
      <div className={styles.content}>{children}</div>
    </Collapse>
  </div>
);

const dummyProducts = [
  { name: "Product A", uploadedFileData: { path: "public/assets/pictures/default.png", mimeType: "image/png" } },
  { name: "Product B", uploadedFileData: { path: "public/assets/pictures/default.png", mimeType: "image/png" } },
  { name: "Product C", uploadedFileData: { path: "public/assets/pictures/default.png", mimeType: "image/png" } },
];

const dummyServices = [
  { name: "Service X", uploadedFileData: { path: "public/assets/pictures/default.png", mimeType: "image/png" } },
  { name: "Service Y", uploadedFileData: { path: "public/assets/pictures/default.png", mimeType: "image/png" } },
  { name: "Service Z", uploadedFileData: { path: "public/assets/pictures/default.png", mimeType: "image/png" } },
];

const Business = ({ isPrivateDeal }) => {
  const dealDetails = useDealStore((state) => state.dealDetails);
  const business = dealDetails?.data?.business;
  const companyName = dealDetails?.data?.deal_setpData?.company_name || "Company"; // ✅ Fallback for missing name

  const renderFiles = (files) => {
    if (!files || !Array.isArray(files) || files.length === 0) return null;

    return (
      <div className={styles.clients} style={{ marginTop: "16px", marginBottom: "16px" }}>
        {files.map((file, idx) => {
          const isImage = file?.mimeType?.startsWith("image/");
          const isVideo = file?.mimeType?.startsWith("video/");
          
          const cleanedPath = file?.path ? file.path.replace(/^\/+/, "").replace(/^public\//, "") : "";
          const baseUrl = process.env.NEXT_PUBLIC_USER_BASE || "";
          const baseAdmin = baseUrl.endsWith("/") ? `${baseUrl}admin` : `${baseUrl}/admin`;
          const normalizedPath = cleanedPath.startsWith("/") ? cleanedPath : `/${cleanedPath}`;
          const fileUrl = `${baseAdmin}${normalizedPath}`;

          const altText = `${file.fileName || "Media"} - ${companyName}`;

          return (
            <div key={idx} className={styles.card} style={{ height: "150px" }}>
              <div className={styles.imageWrapper}>
                {isImage ? (
                  <SafeImage
                    src={fileUrl}
                    alt={altText}
                    className={styles.cardImage}
                  />
                ) : isVideo ? (
                  <video
                    src={fileUrl}
                    controls
                    className={styles.cardImage}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : null}
                <div className={styles.overlay}></div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Determine data sources for Products and Services
  const productsObj = business?.products_and_services?.status 
    ? business.products_and_services.data?.products 
    : business?.products;
    
  const servicesObj = business?.products_and_services?.status 
    ? business.products_and_services.data?.services 
    : business?.services;

  const productsData = Array.isArray(productsObj?.data) ? productsObj.data : null;
  const productsTitle = productsObj?.label_name || "Products";

  const servicesData = Array.isArray(servicesObj?.data) ? servicesObj.data : null;
  const servicesTitle = servicesObj?.label_name || "Services";

  const businessModelTitle = business?.business_model?.label_name || "Business Model";
  const salesChannelTitle = business?.sales_channel?.label_name || "Sales Channel";

  const [openStates, setOpenStates] = useState({});

  useEffect(() => {
    if (business) {
      setOpenStates({
        [productsTitle]: true,
        [servicesTitle]: true,
        "Geographical Presence": !!business?.geographical_presence?.status,
        [businessModelTitle]: !!business?.business_model?.status,
        [salesChannelTitle]: !!business?.sales_channel?.status,
        "Clients": !!business?.clients?.status,
      });
    }
  }, [business, productsTitle, servicesTitle, businessModelTitle, salesChannelTitle]);

  const toggleDropdown = (title) => {
    setOpenStates((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  if (!business) return null;

  const activeSections = [];

  if (productsData && productsData.length > 0) {
    activeSections.push(
      <Dropdown
        key="products"
        title={productsTitle}
        isOpen={openStates[productsTitle]}
        onToggle={toggleDropdown}
        isPrivateDeal={isPrivateDeal}
      >
        <div className={styles.clients}>
          {productsData.map((item, index) => {
            const file = item.uploadedFileData;
            const imagePath = file?.path?.replace("public", "");
            const isImage = file?.mimeType?.startsWith("image/");
            const imageUrl = isImage
              ? `${process.env.NEXT_PUBLIC_USER_BASE}admin/${imagePath}`
              : "/assets/pictures/default.png";

            const altText = `${item.name || "Product"} - ${companyName}`;

            return (
              <div key={index} className={styles.card}>
                <div className={styles.imageWrapper}>
                  <SafeImage
                    src={imageUrl}
                    alt={altText}
                    className={styles.cardImage}
                  />
                  <div className={styles.overlay}></div>
                  <div className={styles.productName}>{item.name}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Dropdown>
    );
  }

  if (servicesData && servicesData.length > 0) {
    activeSections.push(
      <Dropdown
        key="services"
        title={servicesTitle}
        isOpen={openStates[servicesTitle]}
        onToggle={toggleDropdown}
        isPrivateDeal={isPrivateDeal}
      >
        <div className={styles.clients}>
          {servicesData.map((item, index) => {
            const file = item.uploadedFileData;
            const imagePath = file?.path?.replace("public", "");
            const isImage = file?.mimeType?.startsWith("image/");
            const imageUrl = isImage
              ? `${process.env.NEXT_PUBLIC_USER_BASE}admin/${imagePath}`
              : "/assets/pictures/default.png";

            const altText = `${item.name || "Service"} - ${companyName}`;

            return (
              <div key={index} className={styles.card}>
                <div className={styles.imageWrapper}>
                  <SafeImage
                    src={imageUrl}
                    alt={altText}
                    className={styles.cardImage}
                  />
                  <div className={styles.overlay}></div>
                  <div className={styles.productName}>{item.name}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Dropdown>
    );
  }

  if (business?.geographical_presence?.status) {
    activeSections.push(
      <Dropdown
        key="geo"
        title="Geographical Presence"
        isOpen={openStates["Geographical Presence"]}
        onToggle={toggleDropdown}
        isPrivateDeal={isPrivateDeal}
      >
        {typeof business.geographical_presence.data === "string" ? (
          <div
            className={styles.businessModal}
            dangerouslySetInnerHTML={{ __html: business.geographical_presence.data }}
          />
        ) : Array.isArray(business.geographical_presence.data?.data) ? (
          business.geographical_presence.data.data.map((item, index) => (
            <div key={index} className={styles.pTag}>
              {item.label_name && <strong className={styles.strong}>{item.label_name}</strong>}
              <div className={styles.businessModal} dangerouslySetInnerHTML={{ __html: item.content }} />
              {renderFiles(item.files)}
            </div>
          ))
        ) : Array.isArray(business.geographical_presence.data) ? (
          business.geographical_presence.data.map((item, index) => (
            <div key={index} className={styles.pTag}>
              {item.label_name && <strong className={styles.strong}>{item.label_name}</strong>}
              <div className={styles.businessModal} dangerouslySetInnerHTML={{ __html: item.content }} />
              {renderFiles(item.files)}
            </div>
          ))
        ) : business.geographical_presence.data?.content ? (
          <div className={styles.pTag}>
            <div className={styles.businessModal} dangerouslySetInnerHTML={{ __html: business.geographical_presence.data.content }} />
            {renderFiles(business.geographical_presence.data.files)}
          </div>
        ) : null}
      </Dropdown>
    );
  }

  if (business?.business_model?.status) {
    activeSections.push(
      <Dropdown
        key="model"
        title={businessModelTitle}
        isOpen={openStates[businessModelTitle]}
        onToggle={toggleDropdown}
        isPrivateDeal={isPrivateDeal}
      >
        {business.business_model ? (
          <div className={styles.pTag}>
            {typeof business.business_model.data === "string" ? (
              <div
                className={styles.businessModal}
                dangerouslySetInnerHTML={{ __html: business.business_model.data }}
              />
            ) : Array.isArray(business.business_model.data?.data) ? (
              business.business_model.data.data.map((item, index) => (
                <div key={index} className={styles.pTag} style={{ paddingLeft: "0", paddingRight: "0" }}>
                  {item.label_name && <strong className={styles.strong}>{item.label_name}</strong>}
                  <div className={styles.businessModal} dangerouslySetInnerHTML={{ __html: item.content }} />
                  {renderFiles(item.files)}
                </div>
              ))
            ) : Array.isArray(business.business_model.data) ? (
              business.business_model.data.map((item, index) => (
                <div key={index} className={styles.pTag} style={{ paddingLeft: "0", paddingRight: "0" }}>
                  {item.label_name && <strong className={styles.strong}>{item.label_name}</strong>}
                  <div className={styles.businessModal} dangerouslySetInnerHTML={{ __html: item.content }} />
                  {renderFiles(item.files)}
                </div>
              ))
            ) : business.business_model.data?.content ? (
              <div>
                <div className={styles.businessModal} dangerouslySetInnerHTML={{ __html: business.business_model.data.content }} />
                {renderFiles(business.business_model.data.files)}
              </div>
            ) : null}
            {renderFiles(business.business_model.files)}
          </div>
        ) : null}
      </Dropdown>
    );
  }

  if (business?.sales_channel?.status) {
    activeSections.push(
      <Dropdown
        key="sales"
        title={salesChannelTitle}
        isOpen={openStates[salesChannelTitle]}
        onToggle={toggleDropdown}
        isPrivateDeal={isPrivateDeal}
      >
        {business.sales_channel ? (
          <div className={styles.pTag}>
            {typeof business.sales_channel.data === "string" ? (
              <div
                className={styles.businessModal}
                dangerouslySetInnerHTML={{ __html: business.sales_channel.data }}
              />
            ) : Array.isArray(business.sales_channel.data?.data) ? (
              business.sales_channel.data.data.map((item, index) => (
                <div key={index} className={styles.pTag} style={{ paddingLeft: "0", paddingRight: "0" }}>
                  {item.label_name && <strong className={styles.strong}>{item.label_name}</strong>}
                  <div className={styles.businessModal} dangerouslySetInnerHTML={{ __html: item.content }} />
                  {renderFiles(item.files)}
                </div>
              ))
            ) : Array.isArray(business.sales_channel.data) ? (
              business.sales_channel.data.map((item, index) => (
                <div key={index} className={styles.pTag} style={{ paddingLeft: "0", paddingRight: "0" }}>
                  {item.label_name && <strong className={styles.strong}>{item.label_name}</strong>}
                  <div className={styles.businessModal} dangerouslySetInnerHTML={{ __html: item.content }} />
                  {renderFiles(item.files)}
                </div>
              ))
            ) : business.sales_channel.data?.content ? (
              <div>
                <div className={styles.businessModal} dangerouslySetInnerHTML={{ __html: business.sales_channel.data.content }} />
                {renderFiles(business.sales_channel.data.files)}
              </div>
            ) : null}
            {renderFiles(business.sales_channel.files)}
          </div>
        ) : null}
      </Dropdown>
    );
  }

  if (business?.clients?.status && Array.isArray(business.clients.data) && business.clients.data.length > 0) {
    activeSections.push(
      <Dropdown
        key="clients"
        title="Clients"
        isOpen={openStates["Clients"]}
        onToggle={toggleDropdown}
        isPrivateDeal={isPrivateDeal}
      >
        <div className={styles.clients}>
          {business?.clients.data.map((client, index) => {
            const file = client.uploadedFileData;
            const imagePath = file?.path?.replace("public", "");
            const isImage = file?.mimeType?.startsWith("image/");
            const imageUrl = isImage
              ? `${process.env.NEXT_PUBLIC_USER_BASE}admin/${imagePath}`
              : "/fallbackImages.png";

            const altText = `${client.name || "Client"} - ${companyName}`;

            return (
              <div key={index} className={styles.clientcardwrap}>
                <SafeImage
                  src={imageUrl}
                  alt={altText}
                  className={styles.clientcardImage}
                />
                <div className={styles.clientName}>{client.name}</div>
              </div>
            );
          })}
        </div>
      </Dropdown>
    );
  }

  if (activeSections.length === 0) return null;

  return (
    <div
      className={`${styles.container} ${
        isPrivateDeal ? styles.privateDeal : ""
      }`}
    >
      {activeSections.map((section, index) => (
        <React.Fragment key={index}>
          {section}
          {index < activeSections.length - 1 && <hr className={styles.hr} />}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Business;
