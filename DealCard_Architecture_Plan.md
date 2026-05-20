# Scalable DealCard Architecture Plan (Updated with UI Variants)

This document outlines a production-ready, highly scalable architecture for rendering `DealCard` components, updated to accommodate the 5 distinct UI variations identified in the screenshots. It uses a **Configuration-Driven & Compound Component** pattern.

## 1. Architectural Strategy

We will build ONE single `<DealCard />` root component that acts as an orchestrator. To support the drastic visual differences (Light mode, Dark mode, various highlight box styles, progress bars, varying badge layouts), we will use:

1.  **Themes & Variants:** Config objects mapping `dealType` to visual themes (Light, Dark Gold, Dark Green) and layouts.
2.  **Compound Components / Sections:** Break the card into agnostic sections:
    - `<CardHeader />` (Badges, Exclusive Pill, Ratings)
    - `<CardCompanyInfo />` (Logo, Name, Tagline)
    - `<CardHeroMetrics />` (The prominent metrics: 2 highlighted boxes OR line-separated metrics with a button)
    - `<CardMetricsGrid />` (Standard grid metrics)
    - `<CardProgress />` (Funding progress bar, if applicable)
    - `<CardTags />` (e.g., "MARKET LEADER", "PROFITABLE")
    - `<CardFooter />` (Q&A counts and avatars)
3.  **Data Mapping:** The sections receive configuration arrays detailing *how* to extract and format data from the `deal` object, preventing hardcoded keys inside the JSX.

## 2. Identified UI Variations (From Screenshots)

1. **Variant A (Public/IPO Deep Dive):** Light theme, lots of top badges (Live, High Conviction, Pr.Eqt Choice), large rating (4.2), 3 hero metrics separated by vertical lines, and a large black "DETAILED DEEP DIVE" action button. No grid, no progress bar, no footer.
2. **Variant B (Public/IPO EV):** Light theme, standard badges (Live, IPO-SME), pill rating (4.5), 2 large hero metric boxes (Issue Size, GMP), 3x2 metrics grid, tags, and standard footer.
3. **Variant C (Unlisted/NSE):** Light theme, standard badges, pill rating, 2 large hero metric boxes (Valuation, Share Price), 3x2 metrics grid, tags, and standard footer.
4. **Variant D (Pre IPO-SME Exclusive):** Dark theme with gold accent, "Exclusive Deal" pill top right. 3x2 metrics grid, progress bar, tags, and footer. (No hero metric boxes).
5. **Variant E (Series A):** Dark theme with green/gold gradient. "Round Open" badge. 2 large hero metric boxes (Round Size, Stage), 2x2 or 2x3 metrics grid, progress bar, tags, and footer.

## 3. Proposed Folder Structure

```text
src/app/deals/components/DealCard/
├── index.js                    # Public API export
├── DealCard.jsx                # Root orchestrator component
├── DealCard.module.css         # Main container styles (CSS Modules)
├── config/
│   ├── index.js                # Exports config maps
│   ├── themes.js               # Theme mapping (light, dark-gold, dark-green)
│   ├── layouts.js              # Defines which sections render for which dealType/variant
│   ├── metricsMap.js           # Defines which fields to map to Hero Metrics and Grid
├── sections/                   # Reusable Sub-components
│   ├── CardHeader.jsx
│   ├── CardCompanyInfo.jsx
│   ├── CardHeroMetrics.jsx     # Supports 'boxes' or 'inline-divided' styles
│   ├── CardMetricsGrid.jsx
│   ├── CardProgress.jsx
│   ├── CardTags.jsx
│   ├── CardFooter.jsx
│   ├── HiddenOverlay.jsx       # Renders when user is not authenticated
├── ui/                         # Atomic components
│   ├── Badge.jsx               # Supports 'dot', 'outline', 'solid', 'pill'
│   ├── RatingBadge.jsx         # Supports 'large' and 'pill' styles
│   ├── AvatarGroup.jsx
```

## 4. Configuration-Driven Approach

### Example: `layouts.js` & `themes.js`
```javascript
export const CARD_THEMES = {
    public_deep_dive: { theme: 'light', gradient: null },
    public_standard: { theme: 'light', gradient: null },
    pre_ipo_exclusive: { theme: 'dark', gradient: 'gold-accent' },
    series_a: { theme: 'dark', gradient: 'green-gold' }
};

export const CARD_LAYOUTS = {
    public_deep_dive: {
        sections: ['header', 'companyInfo', 'heroMetrics', 'actionButton'],
        heroStyle: 'divided', // e.g., Issue Size | GMP | Open Date
        ratingStyle: 'large',
    },
    series_a: {
        sections: ['header', 'companyInfo', 'heroMetrics', 'metricsGrid', 'progress', 'tags', 'footer'],
        heroStyle: 'boxes', // e.g., [Round Size] [Stage]
        ratingStyle: 'none',
    }
};
```

### Example: `metricsMap.js`
Defines exactly what the `CardHeroMetrics` and `CardMetricsGrid` sections should render.
```javascript
export const METRICS_CONFIG = {
    series_a: {
        hero: [
            { label: "Round Size", key: "round_size", format: "currency", suffix: "Cr" },
            { label: "Stage", key: "stage", format: "text" }
        ],
        grid: [
            { label: "Valuation", key: "valuation", format: "currency", suffix: "Cr" },
            { label: "REV ARR", key: "rev_arr", format: "currency", suffix: "Cr" },
            { label: "Gross Margin", key: "gross_margin", format: "percent" },
            // ...
        ]
    }
};
```

## 5. Dynamic Rendering Approach (The Component)

The root `<DealCard />` retrieves its configuration based on a computed `variantKey` (derived from `deal_type`, `stage`, or explicit flags like `deep_dive`) and injects it into the reusable sections.

```javascript
// src/app/deals/components/DealCard/DealCard.jsx
import { CARD_THEMES, CARD_LAYOUTS, METRICS_CONFIG } from './config';
import * as Sections from './sections';
import styles from './DealCard.module.css';

export default function DealCard({ deal, variantOverride, isAuthenticated }) {
    // 1. Determine Variant
    const variantKey = variantOverride || determineVariant(deal);
    const theme = CARD_THE: [variantKey];
    const layout = CARD_LAYOUTS[variantKey];
    const metrics = METRICS_CONFIG[variantKey];

    // Handle Auth Locked State
    if (!isAuthenticated && deal.isPrivate) return <Sections.HiddenOverlay />;

    return (
        <div className={`${styles.cardContainer} ${styles[theme.theme]} ${styles[theme.gradient]}`}>
            {layout.sections.includes('header') && <Sections.CardHeader deal={deal} layout={layout} />}
            {layout.sections.includes('companyInfo') && <Sections.CardCompanyInfo deal={deal} />}
            {layout.sections.includes('heroMetrics') && <Sections.CardHeroMetrics deal={deal} config={metrics.hero} style={layout.heroStyle} />}
            {layout.sections.includes('metricsGrid') && <Sections.CardMetricsGrid deal={deal} config={metrics.grid} />}
            {layout.sections.includes('progress') && <Sections.CardProgress deal={deal} />}
            {layout.sections.includes('tags') && <Sections.CardTags deal={deal} />}
            {layout.sections.includes('footer') && <Sections.CardFooter deal={deal} />}
            {layout.sections.includes('actionButton') && <Sections.CardActionButton deal={deal} />}
        </div>
    );
}
```

## 6. Scaling Strategy for Future Cards

- **New Deal Type / Visual Variant?** Add a new key to `CARD_THEMES`, `CARD_LAYOUTS`, and `METRICS_CONFIG`. You do not need to touch `DealCard.jsx` or duplicate the component.
- **New Data Metric?** Just add it to the `grid` or `hero` array in `metricsMap.js` along with its format type (e.g., `currency`, `percent`, `multiplier`).
- **New Section?** Create a new component inside `sections/` and add it to the `layout.sections` array for the variants that need it.

## Open Questions

> **Component Location:** I have designated `src/app/deals/components/DealCard` for the new architecture. Please confirm.
> 
> **Variant Mapping Logic:** Since the backend data structure defines `deal_type` (public, private, ccps, ofs), we will need a small utility function `determineVariant(deal)` to map the raw API data to one of the 5 specific visual variants (e.g., deciding if a public deal should use the "deep dive" layout vs the standard layout). Do we have a specific field in the API (like `is_deep_dive`) to distinguish Variant A from Variant B?
