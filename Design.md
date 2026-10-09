---
name: Tactile Note Board
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#534434'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#867461'
  outline-variant: '#d8c3ad'
  surface-tint: '#855300'
  primary: '#855300'
  on-primary: '#ffffff'
  primary-container: '#f59e0b'
  on-primary-container: '#613b00'
  inverse-primary: '#ffb95f'
  secondary: '#b61722'
  on-secondary: '#ffffff'
  secondary-container: '#da3437'
  on-secondary-container: '#fffbff'
  tertiary: '#006591'
  on-tertiary: '#ffffff'
  tertiary-container: '#42bbff'
  on-tertiary-container: '#004869'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffddb8'
  primary-fixed-dim: '#ffb95f'
  on-primary-fixed: '#2a1700'
  on-primary-fixed-variant: '#653e00'
  secondary-fixed: '#ffdad7'
  secondary-fixed-dim: '#ffb3ad'
  on-secondary-fixed: '#410004'
  on-secondary-fixed-variant: '#930013'
  tertiary-fixed: '#c9e6ff'
  tertiary-fixed-dim: '#89ceff'
  on-tertiary-fixed: '#001e2f'
  on-tertiary-fixed-variant: '#004c6e'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 0.75rem
  gutter-desktop: 1.25rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system synthesizes warm, tactile stationery aesthetics with a razor-sharp, modern digital interface. It bridges the physical satisfaction of sticky-note memo planning—peeling, taping, pinning, and checking off tasks—with the clarity, modularity, and responsiveness expected of a mobile web application.

The visual direction embraces **Tactile Minimalism**:
- **Tactile Familiarity:** Surfaces evoke lightweight paper slips, subtle skew angles (-1deg to 1deg on dynamic drag/drop), micro-shadows that lift off the board, and masking tape or pushpin motifs for priority states.
- **Digital Clarity:** Clean spacing, geometric typography, zero skeuomorphic clutter (no fake paper tears or heavy textures), and effortless touch affordances.
- **Emotional Tone:** Encouraging, warm, organized, and delightful without feeling childish. It transforms routine chore tracking into an inviting spatial canvas.

## Colors

The palette revolves around vibrant sticky-note hues anchored by a functional slate neutral system.

### Semantic & Sticky Note Surfaces
Sticky-note items rely on calibrated pastel background pairs, ensuring high contrast against text while holding their physical paper presence:
- **Warm Canary (Default Tasks):** Base `#FEF08A` / Tint `#FFFBEB` with deep amber text `#78350F`.
- **Fresh Mint (Completed / Habits):** Base `#BBF7D0` / Tint `#F0FDF4` with forest slate text `#14532D`.
- **Sky Breeze (Ideas / Work):** Base `#BAE6FD` / Tint `#F0F9FF` with deep ocean text `#0C4A6E`.
- **Sweet Rose (Urgent / Personal):** Base `#FBCFE8` / Tint `#FDF2F8` with berry plum text `#831843`.

### Interactive Accents & Pin Metaphors
- **Brand Amber (`#F59E0B` / `#FBBF24`):** Primary action buttons, active tab indicators, and progress states.
- **Pin Coral (`#EF4444`):** Fixed memo pins, high-priority flags, and destructive confirmations.

### Background & Neutral Gradients
- **Light Mode Board Canvas:** Clean slate `#F8FAFC`, with subtle sub-surfaces at `#F1F5F9`.
- **Dark Mode Board Canvas:** Deep slate charcoal `#0F172A` with card surfaces using tinted dark bases (`#1E293B`) layered with low-opacity pastel accent borders (12–18% opacity) to preserve color-coding without screen glare.

## Typography

The typography couples the modern, structural legibility of **Inter** and **Plus Jakarta Sans** with a crisp, technical mono touch (**JetBrains Mono**) for timestamps, item counts, and metadata tags.

- **Headlines (Plus Jakarta Sans):** Delivers geometric confidence, open apertures, and friendly balance on mobile boards.
- **Body & Task Content (Inter):** Highly legible at all sizes, handling multiline Korean and Latin text within dense sticky-note spaces without vertical overcrowding.
- **Handwritten / Casual Moments:** Optional display micro-accents (such as sticker notes or celebration text) can leverage italicized body weights or casual script glyphs, while system status always remains strictly in primary sans weights.

## Layout & Spacing

The layout is built around a spatial canvas model that scales seamlessly from a single-column mobile feed to a multi-column masonry pinboard.

### Breakpoints & Grid Architecture
- **Mobile (< 640px):** Single-column vertical stream or 2-column compact masonry grid. Margin is locked to `1rem` (16px) with an inner column gutter of `0.75rem` (12px). Sticky cards conform to dynamic heights based on content.
- **Tablet (640px – 1024px):** 2 to 3-column masonry grid. Margins expand to `1.5rem`.
- **Desktop (> 1024px):** Fluid corkboard canvas with 3 to 4 auto-flowing columns, capped at a maximum container width of `1280px` for optimal viewing.

### Spacing Principles
Sticky cards use condensed internal padding (`space-md` / 16px) to maximize touch targets without consuming excessive vertical screen real estate. Quick toolbars and bottom interaction docks adhere strictly to mobile thumb zones.

## Elevation & Depth

Visual hierarchy is communicated through realistic paper elevation, directional sunlight casting, and subtle physical tilt states.

### Elevation Levels
1. **Level 0 (Board Base):** Flat, un-elevated backdrop (`#F8FAFC` in light mode, `#0F172A` in dark mode).
2. **Level 1 (Resting Sticky Card):** Soft, multi-layered diffuse shadow mimicking paper laying flat:
   `0 2px 4px -1px rgba(15, 23, 42, 0.06), 0 4px 12px -2px rgba(15, 23, 42, 0.08)`.
3. **Level 2 (Pinned / Active Item):** Slightly lifted bottom corner shadow with a subtle bottom-right offset:
   `0 6px 16px -3px rgba(15, 23, 42, 0.12), 0 10px 24px -4px rgba(245, 158, 11, 0.15)`.
4. **Level 3 (Lifted / Dragging Memo & Overlays):** Deep drop shadow with an active 2-degree rotation angle, simulating a post-it physically detached from the surface:
   `0 16px 32px -6px rgba(15, 23, 42, 0.2), 0 4px 8px -2px rgba(15, 23, 42, 0.08)`.

### Tactile Detail Accents
- **Semi-Translucent Washi Tape:** Positioned at the top center of cards using an ultra-low-opacity frost white (`rgba(255, 255, 255, 0.65)`) with a light inner border and slight backdrop blur.
- **Pushpins:** Circular badge elements (`#EF4444`) casting a tight drop shadow `0 2px 4px rgba(0, 0, 0, 0.3)`.

## Shapes

The shape system employs rounded corners that convey friendliness while retaining the clean perimeter of cut paper memos.

- **Sticky Note Cards:** Styled with `rounded-xl` (1rem / 16px) to remove harsh paper points while keeping rectangular utility.
- **Controls & Chips:** Filter tags, category selectors, and input boxes use `rounded-lg` (0.75rem / 12px) to match the internal structure of cards.
- **Interactive Badges & Pushpins:** Rounded full/pill geometry for status counters, category pills, and circular floating action buttons (FAB).

## Components

### Sticky Note Cards
- **Base Style:** Pastel background tints paired with matching dark-toned typography. Left edge or top header features an optional washi-tape or pushpin anchor.
- **Actions:** Quick-check checkbox at top-left, contextual dropdown menu (color switch, archive, delete) at top-right.
- **Interactive States:** On press/hold, card scales to `0.98` with a spring transition; on drag, card lifts to Elevation Level 3 and rotates by `1.5deg`.

### Checkboxes & Completion Toggles
- Custom circular or rounded-square check targets (minimum 24x24px hit area with 44px touch container).
- Unchecked: 1.5px border colored to complement the card's accent tint.
- Checked: Animated strike-through across the task title, accompanied by a spring-animated checkmark fill and a 50% opacity fade of the card background.

### Filter & Tag Bar
- Horizontally scrollable chip row on mobile screens.
- Pill-shaped chips (`rounded-full`) displaying category counts in `JetBrains Mono`.
- Active chip fills with solid Amber (`#F59E0B`) or Slate Neutral, inactive chips carry a subtle border and transparent surface.

### Category Dropdown
- Clean popover with rounded corners (`rounded-xl`), matching Elevation Level 2.
- Color swatches embedded directly in dropdown items to quickly switch sticky-note tones.

### Floating Action Button (FAB) & Quick Input Dock
- Bottom-fixed, thumb-accessible floating compose trigger with Amber gradient (`#F59E0B` to `#FBBF24`).
- Tapping triggers a "slap-and-stick" micro-interaction where a fresh note bounces gently onto the screen canvas.