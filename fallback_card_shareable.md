# Premium FallbackCard Component (React + CSS Modules)

This document contains the complete, self-contained code for the `FallbackCard` component, optimized for presentation and sharing. It features a modern, glassmorphic layout, a rich gold gradient aesthetic, and carefully coordinated SVG micro-animations that represent a high level of frontend craftsmanship.

---

## 1. React Component File: `FallbackCard.jsx`

Save the following code as `FallbackCard.jsx`. It defines the component structure and imports its corresponding CSS Module.

```jsx
import React from 'react';
import styles from './FallbackCard.module.css';

export default function FallbackCard() {
    return (
        <div className={styles.fallbackContainer}>
            {/* Ambient Background Glow for Premium Feel */}
            <div className={styles.ambientGlow} />

            {/* Animating Shapes SVG Container */}
            <div className={styles.shapesContainer}>
                <svg 
                    width="100%" 
                    height="100%" 
                    viewBox="0 0 49 49" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className={styles.shapesSvg}
                >
                    <defs>
                        {/* Premium multi-stop gold gradient */}
                        <linearGradient id="gold-gradient" x1="0" y1="0" x2="1" y2="0" gradientTransform="rotate(113.27 0.5 0.5)">
                            <stop offset="15.04%" stopColor="#D2C299" />
                            <stop offset="84.96%" stopColor="#8E6B0F" />
                        </linearGradient>
                    </defs>
                    
                    {/* Top Left: Circle (shrinks and grows) */}
                    <circle className={styles.circleTop} cx="11.25" cy="11.25" r="11.25" fill="url(#gold-gradient)" />
                    
                    {/* Top Right: Square (translates top-down) */}
                    <rect className={styles.squareTop} x="26.5" y="0" width="22.5" height="22.5" rx="4" fill="url(#gold-gradient)" />
                    
                    {/* Bottom Left: Triangle (rotates 360deg and pauses) */}
                    <path className={styles.triangleBottom} d="M 11.25 29.5 L 19.5 46 L 3 46 Z" fill="url(#gold-gradient)" stroke="url(#gold-gradient)" strokeWidth="6" strokeLinejoin="round" />
                    
                    {/* Bottom Right: Circle (gets constricted when square is down) */}
                    <circle className={styles.circleBottom} cx="37.75" cy="37.75" r="11.25" fill="url(#gold-gradient)" />
                </svg>
            </div>

            {/* Content Text Section */}
            <div className={styles.contentSection}>
                <h3 className={styles.fallbackTitle}>Personalizing Opportunities</h3>
                <p className={styles.fallbackSubtitle}>Our team is curating the best deals for you.</p>
                <p className={styles.fallbackSubSubtitle}>Check back soon for exciting offers!</p>
            </div>
        </div>
    );
}
```

---

## 2. CSS Module File: `FallbackCard.module.css`

Save the following code as `FallbackCard.module.css` in the same directory as the JSX file. It sets up the premium glassmorphic container, theme variables, and coordinates the entrance/loop animations.

```css
/* =========================================================================
   1. Theme Variables & Reset
   ========================================================================= */
:root {
    --gold-primary: #A87E3B;
    --gold-bright: #E6C875;
    --gold-gradient-start: #D2C299;
    --gold-gradient-end: #8E6B0F;
    
    /* Default Light Mode Colors */
    --card-bg: rgba(255, 255, 255, 0.75);
    --card-border: rgba(142, 107, 15, 0.08);
    --text-primary: #1E293B;
    --text-secondary: #64748B;
    --text-muted: #94A3B8;
    --shadow-color: rgba(142, 107, 15, 0.04);
    --glow-opacity: 0.15;
}

/* Automatic Dark Mode Support */
@media (prefers-color-scheme: dark) {
    :root {
        --card-bg: rgba(26, 26, 36, 0.8);
        --card-border: rgba(230, 200, 117, 0.12);
        --text-primary: #F8FAFC;
        --text-secondary: #94A3B8;
        --text-muted: #64748B;
        --shadow-color: rgba(0, 0, 0, 0.3);
        --glow-opacity: 0.25;
    }
}

/* =========================================================================
   2. Card Container (Premium Glassmorphic Layout)
   ========================================================================= */
.fallbackContainer {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 24px;
    padding: 60px 24px;
    width: 100%;
    height: 343px;
    box-shadow: 0 10px 40px var(--shadow-color);
    box-sizing: border-box;
    overflow: hidden;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.fallbackContainer:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 45px rgba(142, 107, 15, 0.08);
}

/* Soft gold background glow */
.ambientGlow {
    position: absolute;
    top: -50%;
    left: -50%;
    right: -50%;
    bottom: -50%;
    background: radial-gradient(circle, rgba(230, 200, 117, 0.08) 0%, rgba(255,255,255,0) 70%);
    pointer-events: none;
    z-index: 0;
    opacity: var(--glow-opacity);
}

/* =========================================================================
   3. SVG Shapes & Layout
   ========================================================================= */
.shapesContainer {
    width: 50px;
    height: 50px;
    margin-bottom: 28px;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1;
}

.shapesSvg {
    overflow: visible;
}

.contentSection {
    z-index: 1;
}

/* =========================================================================
   4. SVG Shape Animations & Timings
   ========================================================================= */
.circleTop {
    transform-origin: 11.25px 11.25px;
    opacity: 0;
    transform: scale(0);
    animation: shape-entrance 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards,
               shrink-grow 2.5s ease-in-out infinite 0.9s;
}

.squareTop {
    transform-origin: 37.75px 11.25px;
    opacity: 0;
    transform: scale(0);
    animation: shape-entrance 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s forwards,
               square-translate 2.5s ease-in-out infinite 0.9s;
}

.triangleBottom {
    transform-origin: 11.25px 41.5px;
    opacity: 0;
    transform: scale(0);
    animation: shape-entrance 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s forwards,
               rotate-triangle 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite 0.9s;
}

.circleBottom {
    transform-origin: 37.75px 49px; /* Bottom edge of the circle (base coordinates) */
    opacity: 0;
    transform: scale(0);
    animation: shape-entrance 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.45s forwards,
               circle-constrict 2.5s ease-in-out infinite 0.9s;
}

/* =========================================================================
   5. Keyframes
   ========================================================================= */

/* Entrance: Staggered scaling & fade-in */
@keyframes shape-entrance {
    0% {
        opacity: 0;
        transform: scale(0);
    }
    100% {
        opacity: 1;
        transform: scale(1);
    }
}

/* Top Left Circle: Smooth heartbeat shrink and grow */
@keyframes shrink-grow {
    0%, 30%, 100% {
        transform: scale(1);
    }
    60% {
        transform: scale(0.75);
    }
}

/* Bottom Left Triangle: Rotates 360 degrees and pauses */
@keyframes rotate-triangle {
    0%, 30% {
        transform: rotate(0deg);
    }
    75%, 100% {
        transform: rotate(360deg);
    }
}

/* Top Right Square: Moves downwards to squash the bottom right circle */
@keyframes square-translate {
    0%, 30%, 100% {
        transform: translateY(0);
    }
    55% {
        transform: translateY(17.5px); /* Moves down exactly to compress the circle */
    }
}

/* Bottom Right Circle: Compresses vertically (squash) when the square lands on it */
@keyframes circle-constrict {
    0%, 30%, 100% {
        transform: scaleY(1) scaleX(1);
    }
    55% {
        transform: scaleY(0.4) scaleX(1.2); /* Anchored at base, spreads wider as it flattens */
    }
}

/* =========================================================================
   6. Typography & Responsive Design
   ========================================================================= */
.fallbackTitle {
    font-size: 24px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 10px 0;
    font-family: system-ui, -apple-system, sans-serif;
    letter-spacing: -0.02em;
    transition: color 0.3s ease;
}

.fallbackSubtitle {
    font-size: 15px;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.5;
    font-family: system-ui, -apple-system, sans-serif;
    transition: color 0.3s ease;
}

.fallbackSubSubtitle {
    font-size: 14px;
    color: var(--text-muted);
    margin: 6px 0 0 0;
    line-height: 1.5;
    font-family: system-ui, -apple-system, sans-serif;
    transition: color 0.3s ease;
}

/* Responsive adjustments for mobile screens */
@media (max-width: 576px) {
    .fallbackContainer {
        padding: 40px 16px;
        height: auto;
        min-height: 300px;
    }

    .shapesContainer {
        margin-bottom: 20px;
    }

    .fallbackTitle {
        font-size: 20px;
        margin-bottom: 8px;
    }

    .fallbackSubtitle {
        font-size: 14px;
    }

    .fallbackSubSubtitle {
        font-size: 13px;
        margin-top: 4px;
    }
}
```

---

## 3. How the Animations Work (For Your College Presentation/Share)

If you are sharing this with classmates or presenting it, here are the key design highlights you can talk about:

1. **Orchestrated Staggered Entrance**: The four shapes scale up from `0` to `1` using a custom `cubic-bezier(0.34, 1.56, 0.64, 1)` transition (which creates a playful bounce-back effect). Each shape has a progressive delay (`0s`, `0.15s`, `0.3s`, `0.45s`) to create a fluid cascading introduction.
2. **Coordinated Physics (Squash and Stretch)**:
   - The **Top Right Square** translates down by `17.5px`.
   - At the exact same time (`55%` keyframe), the **Bottom Right Circle** compresses vertically to `0.4` scale and stretches horizontally to `1.2` scale.
   - Crucially, the circle uses `transform-origin: 37.75px 49px` (its bottom edge) which keeps it anchored to the ground as it squashes, creating a realistic, high-fidelity physical interaction!
3. **Glassmorphism**: The container utilizes `backdrop-filter: blur(12px)` and translucent borders so it fits beautifully over rich gradient backgrounds.
4. **Dark Mode Integration**: Uses CSS custom variables with a `@media (prefers-color-scheme: dark)` check to dynamically adjust backgrounds and typography colors seamlessly.
