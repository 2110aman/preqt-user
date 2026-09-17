"use client";

import React, { useState, useEffect } from "react";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

export default function ReCaptchaProviderWrapper({ children }) {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const handleTrigger = () => {
      setShouldLoad(true);
      cleanup();
    };

    const cleanup = () => {
      window.removeEventListener("scroll", handleTrigger);
      window.removeEventListener("touchstart", handleTrigger);
      window.removeEventListener("mousemove", handleTrigger);
      window.removeEventListener("click", handleTrigger);
    };

    window.addEventListener("scroll", handleTrigger, { passive: true, once: true });
    window.addEventListener("touchstart", handleTrigger, { passive: true, once: true });
    window.addEventListener("mousemove", handleTrigger, { passive: true, once: true });
    window.addEventListener("click", handleTrigger, { passive: true, once: true });

    // Fallback: load when idle or after 3 seconds
    let timerId;
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      window.requestIdleCallback(() => setShouldLoad(true), { timeout: 3500 });
    } else {
      timerId = setTimeout(() => setShouldLoad(true), 3000);
    }

    return () => {
      cleanup();
      if (timerId) clearTimeout(timerId);
    };
  }, []);

  if (!shouldLoad) {
    return <>{children}</>;
  }

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY || "6LezyRgsAAAAAOCQ0A9TsVlukuTUiWFl5WXuXbyu"}
      scriptProps={{ async: true, defer: true, appendTo: "body" }}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
}


