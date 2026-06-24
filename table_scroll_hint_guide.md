# Responsive Table Scroll Hint & Shadow Overlay System

This document outlines the complete code and structure for implementing the responsive scroll hint and dynamic edge shadows for tables. This pattern is ideal for data tables that overflow horizontally on mobile and smaller viewports.

---

## 1. UX Features
1. **Pulsing Scroll Hint Badge**: A central dismissible badge overlays the table on load if overflow is detected, guiding the user to swipe. It disappears automatically once the user initiates scrolling.
2. **Dynamic Left/Right Shadow Gradients**: Fades in a semi-transparent gradient on the left/right table edge indicating that more columns can be reached by scrolling.
3. **Dark Mode Integration**: Clean transition variables to adjust gradients for dark themes.

---

## 2. React (JSX) Implementation

Below is the state, hook definitions, scroll-checking logic, and component markup.

```jsx
import React, { useState, useEffect, useRef } from "react";

export default function ScrollableTable({ data }) {
  const tableWrapperRef = useRef(null);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(false);

  // Checks scroll position and updates shadow states dynamically
  const checkScroll = () => {
    if (tableWrapperRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tableWrapperRef.current;
      const hasOverflow = scrollWidth > clientWidth;
      
      // Show left shadow if user has scrolled right (threshold of 5px)
      setShowLeftShadow(hasOverflow && scrollLeft > 5);
      
      // Show right shadow if user has not reached the end yet
      setShowRightShadow(hasOverflow && scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  // Check scroll on mount, data changes, and viewport resize
  useEffect(() => {
    checkScroll();

    if (tableWrapperRef.current) {
      const { scrollWidth, clientWidth } = tableWrapperRef.current;
      // Show pulsing hint badge on load if table overflows
      if (scrollWidth > clientWidth) {
        setShowScrollHint(true);
      } else {
        setShowScrollHint(false);
      }
    }

    const element = tableWrapperRef.current;
    if (element) {
      if (typeof window !== "undefined" && "ResizeObserver" in window) {
        const resizeObserver = new ResizeObserver(() => {
          checkScroll();
        });
        resizeObserver.observe(element);
        return () => resizeObserver.disconnect();
      } else {
        window.addEventListener("resize", checkScroll);
        return () => window.removeEventListener("resize", checkScroll);
      }
    }
  }, [data]);

  // Handle scroll event to adjust shadows and dismiss badge
  const handleScroll = () => {
    checkScroll();
    if (showScrollHint) {
      setShowScrollHint(false);
    }
  };

  return (
    <div className="table-wrapper-relative">
      {/* Scroll Edge Shadow Overlays */}
      <div className={`scroll-shadow-left ${showLeftShadow ? "visible" : ""}`} />
      <div className={`scroll-shadow-right ${showRightShadow ? "visible" : ""}`} />
      
      {/* Pulsing Scroll Hint Badge */}
      {showScrollHint && (
        <div className="scroll-hint-badge" onClick={() => setShowScrollHint(false)}>
          <span className="scroll-hint-icon-wrapper">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" >
              <path d="M18 8L22 12L18 16" />
              <path d="M6 8L2 12L6 16" />
              <path d="M2 12H22" />
            </svg>
          </span>
          <span>Scroll to view more</span>
        </div>
      )}

      {/* Overflow Table Container */}
      <div 
        className="tableWrapper"
        ref={tableWrapperRef}
        onScroll={handleScroll}
      >
        <table className="dataTable">
          <thead>
            <tr>
              <th>Financial Metric</th>
              <th>FY 2024</th>
              <th>FY 2025</th>
              <th>FY 2026</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Revenue</td>
              <td>₹100 Cr</td>
              <td>₹150 Cr</td>
              <td>₹200 Cr</td>
            </tr>
            {/* Additional rows... */}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## 3. CSS (Styles) Implementation

Add the following styles to your CSS or Module styles sheet to style the wrapper, shadows, and pulsing badge.

```css
/* Relative wrapper positioning context for shadows and badge */
.table-wrapper-relative {
  position: relative;
  width: 100%;
  margin-top: 12px;
}

/* Left side gradient overlay (fading white-to-transparent) */
.scroll-shadow-left {
  position: absolute;
  top: 1px;
  bottom: 1px;
  left: 1px;
  width: 50px;
  pointer-events: none;
  z-index: 30;
  background: linear-gradient(to right, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0));
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  border-top-left-radius: 11px;
  border-bottom-left-radius: 11px;
}

.scroll-shadow-left.visible {
  opacity: 1;
  visibility: visible;
}

/* Right side gradient overlay (fading white-to-transparent) */
.scroll-shadow-right {
  position: absolute;
  top: 1px;
  bottom: 1px;
  right: 1px;
  width: 50px;
  pointer-events: none;
  z-index: 30;
  background: linear-gradient(to left, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0));
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  border-top-right-radius: 11px;
  border-bottom-right-radius: 11px;
}

.scroll-shadow-right.visible {
  opacity: 1;
  visibility: visible;
}

/* Dark Mode Gradient Overrides (adjust colors based on theme) */
.dark-theme .scroll-shadow-left {
  background: linear-gradient(to right, rgba(24, 24, 27, 0.95), rgba(24, 24, 27, 0));
}

.dark-theme .scroll-shadow-right {
  background: linear-gradient(to left, rgba(24, 24, 27, 0.95), rgba(24, 24, 27, 0));
}

/* Scroll Hint Badge / Swipe Pill */
.scroll-hint-badge {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 40;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(229, 231, 235, 0.6);
  border-radius: 9999px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.08);
  color: #1F2937;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  animation: pulse-scroll-hint 2.5s infinite ease-in-out;
  transition: opacity 0.4s ease, transform 0.4s ease, visibility 0.4s ease;
  user-select: none;
  white-space: nowrap;
}

.scroll-hint-badge:hover {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 12px 30px -3px rgba(181, 145, 49, 0.25);
  border-color: rgba(181, 145, 49, 0.4);
}

.scroll-hint-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #B59131;
}

/* Scrollable Table Container */
.tableWrapper {
  overflow-x: auto;
  width: 100%;
  border-radius: 12px;
  border: 1px solid #E5E7EB;
  scrollbar-width: none; /* Hide scrollbars for clean styling */
}

.tableWrapper::-webkit-scrollbar {
  display: none;
}

/* Pulsing Badge Animation Keyframes */
@keyframes pulse-scroll-hint {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.03);
    box-shadow: 0 15px 30px -3px rgba(181, 145, 49, 0.18);
  }
}
```

---

## 4. How to Use
1. Wrap your scrollable tables in a parent element styled with `position: relative`.
2. Place the dynamic shadow divs inside the wrapper (positioned absolute to overlay the container).
3. Bind the `ref` to the table container and track the native `onScroll` event.
4. Call `checkScroll` inside the React `useEffect` to capture container dimensions dynamically when data loads or viewports resize.
