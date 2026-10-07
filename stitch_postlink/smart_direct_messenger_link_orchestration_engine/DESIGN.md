---
name: Smart Direct Messenger & Link Orchestration Engine
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
  on-surface-variant: '#424751'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#737782'
  outline-variant: '#c2c6d3'
  surface-tint: '#295ea8'
  primary: '#003e80'
  on-primary: '#ffffff'
  primary-container: '#1e56a0'
  on-primary-container: '#b4cdff'
  inverse-primary: '#aac7ff'
  secondary: '#006e2f'
  on-secondary: '#ffffff'
  secondary-container: '#6bff8f'
  on-secondary-container: '#007432'
  tertiary: '#004842'
  on-tertiary: '#ffffff'
  tertiary-container: '#00625a'
  on-tertiary-container: '#72dfd1'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#aac7ff'
  on-primary-fixed: '#001b3e'
  on-primary-fixed-variant: '#00458d'
  secondary-fixed: '#6bff8f'
  secondary-fixed-dim: '#4ae176'
  on-secondary-fixed: '#002109'
  on-secondary-fixed-variant: '#005321'
  tertiary-fixed: '#89f5e7'
  tertiary-fixed-dim: '#6bd8cb'
  on-tertiary-fixed: '#00201d'
  on-tertiary-fixed-variant: '#005049'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes an agile, high-trust SaaS interface engineered specifically for mobile-first marketing managers, e-commerce direct sellers, and growth teams operating primarily via WhatsApp. The product transforms raw links into rich, high-converting WhatsApp media cards, instant deep-links, and conversational triggers.

The visual direction combines **Modern Corporate Precision** with **Tactile Glassmorphism**. It evokes instant technical reliability, rapid performance, and native familiarity with the WhatsApp ecosystem without sacrificing editorial polish. By pairing deep corporate navy blues with vibrant conversational emerald greens against crisp slate canvases, the interface projects clarity, conversion confidence, and operational speed.

## Colors

The palette directly extrapolates the official visual identity into an application-grade color matrix:

- **Primary (`#1E56A0`)**: Solid architectural blue representing technical stability, navigation framing, primary actions, and enterprise SaaS telemetry.
- **Secondary (`#22C55E`)**: Electric conversational green echoing the WhatsApp ecosystem, designated for active states, conversion CTAs, transmission triggers, and positive metric spikes.
- **Tertiary (`#0D9488`)**: Deep teal supporting secondary data visualizations, active status badges, and link routing tags.
- **Neutral (`#0F172A`)**: Deep slate for high-contrast typography and icon clarity, scaling down to `#64748B` for secondary meta text.
- **Surfaces & Canvases**: Base canvas set to slate tint (`#F8FAFC`), supported by pure white cards (`#FFFFFF`) and translucent frosted glass layers (`rgba(255, 255, 255, 0.85)`).
- **Feedback & WhatsApp Chat Surfaces**: Dedicated tint tokens include WhatsApp bubble incoming (`#FFFFFF`), WhatsApp bubble outgoing (`#DCF8C6` / `#D9FDD3`), and alert warnings (`#F59E0B` for uncompressed large images).

## Typography

**Plus Jakarta Sans** is the single typographic voice for the entire interface. Its contemporary geometric geometry, high x-height, and open apertures make micro-copy within complex mobile form fields and WhatsApp preview bubbles legible on OLED mobile displays under variable lighting.

- Headings leverage `700` and `800` weights to firmly anchor user workflows and feature headlines.
- Body levels maintain strict 1.4–1.5 line height ratios to prevent eye strain during link creation and analytics digestion.
- Micro-labels, system statuses, compression indicators, and chat timestamps utilize `label-md` and `label-sm` with tight tracking (`+0.01em`) to maintain sharp legibility at compact dimensions.

## Layout & Spacing

The layout operates on a mobile-first fluid grid structured on an 8pt base grid rhythm:

- **Mobile Viewport (<768px)**: Single-column vertical stream with `margin-mobile` (16px) margins and `gutter-mobile` (12px) separation. Interactive forms anchor to the top, while the realistic WhatsApp live preview docks dynamically as an interactive bottom-sheet or sticky preview card.
- **Tablet / Split View (768px – 1024px)**: 2-column view with 16px gutters, dedicating left-hand columns to configuration controls and right-hand viewports to live rendering.
- **Desktop (1024px+)**: Fixed-center container maxing out at 1200px across 12 fluid columns, maintaining a balanced 7-column builder pane alongside a 5-column phone-mockup dock.

## Elevation & Depth

Visual hierarchy uses layered ambient shadows combined with soft frosted glass:

- **Level 0 (Canvas)**: Background tint at `#F8FAFC`.
- **Level 1 (Form Containers & Data Cards)**: Pure white `#FFFFFF` paired with an ultra-fine border (`1px solid #E2E8F0`) and an ambient drop shadow: `0 2px 8px -2px rgba(15, 23, 42, 0.04), 0 1px 3px -1px rgba(15, 23, 42, 0.06)`.
- **Level 2 (Interactive Floating Elements & Floating Previews)**: Translucent glass layer (`backdrop-filter: blur(12px); background: rgba(255, 255, 255, 0.88)`) with `1px solid rgba(255, 255, 255, 0.6)` top bevel and shadow: `0 12px 24px -6px rgba(30, 86, 160, 0.08), 0 4px 8px -2px rgba(15, 23, 42, 0.04)`.
- **Level 3 (Modal Sheets & Mobile Menus)**: Deep spread shadow `0 20px 32px -8px rgba(15, 23, 42, 0.16)`.
- **WhatsApp Bubble Elevation**: Chat bubbles use WhatsApp's signature shallow relief: `0 1px 0.5px rgba(11, 20, 26, 0.13)`.

## Shapes

The design system adopts a balanced **Rounded** geometry (`roundedness: 2`):

- **Default Form Controls & Standard Cards**: Radius of `0.5rem` (8px), maintaining clean alignment with tabular data and input stacks.
- **Elevated Interactive Cards & Modal Sheets**: Radius of `1rem` (16px), delivering an approachable, handheld mobile tactile feeling.
- **WhatsApp Chat Simulation Bubbles**: Asymmetric radius mirroring WhatsApp's native design: top-left, top-right, and bottom-left rounded at `8px`, with the tail-origin corner sharp or curved at `2px`.
- **Chips, Pill Toggles & Badges**: Fully rounded at `9999px`.

## Components

### Buttons
- **Primary Action (Convert/Send)**: Filled `#22C55E` background, `#FFFFFF` text, `label-lg`, 12px 24px padding, subtle green glow shadow on hover (`0 4px 14px rgba(34, 197, 94, 0.35)`). Active state applies a scale transform (`0.98`).
- **Brand Action (Build Link)**: Solid `#1E56A0` background, `#FFFFFF` text, 8px border radius.
- **Secondary / Ghost**: White background, `1px solid #CBD5E1` border, `#1E56A0` text, transitioning to `#F1F5F9` background on hover.

### Link Input & URL Generator Fields
- Top label in `label-md` `#475569`.
- Input container with `1.5px solid #E2E8F0` border, resting on pure white, 12px internal vertical padding.
- Focused state transitions border to `#1E56A0` with a smooth `0 0 0 3px rgba(30, 86, 160, 0.12)` focus ring.
- Integrated prefix/suffix modules for dynamic custom slugs (e.g., `postlink.io/`) styled with a muted slate fill `#F1F5F9`.

### HD Banner Upload with Compression Engine Meter
- Drag-and-drop container bounded by a `2px dashed #93C5FD` border with light `#EFF6FF` tint.
- **Live Compression Metric Pill**: Displays original file weight vs. compressed webp size (e.g., `3.2MB → 142KB (-95%)`), styled with emerald tag styling `#DCFCE7` text `#15803D`.
- Micro progress track with an animated striped bar in `#22C55E` displaying image optimization state.

### Hyper-Realistic WhatsApp Preview Bubble
- Rendered over the authentic WhatsApp subtle wallpaper pattern (`#EFEAE2` light tint background).
- Chat card bubble: Outgoing message styled in `#E7FFDB` (or `#FFFFFF` for incoming mode), `8px` corner radius with a corner indicator tail.
- Embedded OG Banner Image: Ratio 1.91:1, crisp top corners `7px`, bottom edge flush with metadata.
- Card Body: Bold title (14px, `#111B21`), meta domain in `#667781` (12px), short description (13px, `#3B4A54`), and right-aligned timestamp (11px, `#667781`) accompanied by double-check status marks in WhatsApp blue (`#53BDEB`).

### Chips & Filter Tags
- Height: 32px, `rounded-full`, `1px solid #E2E8F0`, background `#FFFFFF`. Active chips turn `#1E56A0` with white text and an emerald status pip.