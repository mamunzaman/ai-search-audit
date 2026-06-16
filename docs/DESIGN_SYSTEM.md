---
name: Precision Insight System
colors:
  surface: '#fbf8ff'
  surface-dim: '#dad9e4'
  surface-bright: '#fbf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f2fe'
  surface-container: '#eeedf8'
  surface-container-high: '#e8e7f2'
  surface-container-highest: '#e3e1ec'
  on-surface: '#1a1b23'
  on-surface-variant: '#444654'
  inverse-surface: '#2f3038'
  inverse-on-surface: '#f1effb'
  outline: '#757685'
  outline-variant: '#c5c5d6'
  surface-tint: '#3651d0'
  primary: '#00218d'
  on-primary: '#ffffff'
  primary-container: '#1536b8'
  on-primary-container: '#a3b1ff'
  inverse-primary: '#bac3ff'
  secondary: '#4156b9'
  on-secondary: '#ffffff'
  secondary-container: '#8397fe'
  on-secondary-container: '#0d288e'
  tertiary: '#601500'
  on-tertiary: '#ffffff'
  tertiary-container: '#872100'
  on-tertiary-container: '#ff9b7f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dee1ff'
  primary-fixed-dim: '#bac3ff'
  on-primary-fixed: '#001159'
  on-primary-fixed-variant: '#1536b8'
  secondary-fixed: '#dee1ff'
  secondary-fixed-dim: '#b9c3ff'
  on-secondary-fixed: '#001158'
  on-secondary-fixed-variant: '#273d9f'
  tertiary-fixed: '#ffdbd1'
  tertiary-fixed-dim: '#ffb5a0'
  on-tertiary-fixed: '#3b0900'
  on-tertiary-fixed-variant: '#872100'
  background: '#fbf8ff'
  on-background: '#1a1b23'
  surface-variant: '#e3e1ec'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-mono:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: -0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1440px
  gutter: 24px
  margin-desktop: 40px
  margin-mobile: 16px
  stack-xs: 4px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
  stack-xl: 48px
---

## Brand & Style

The design system is engineered for high-stakes data analysis and algorithmic auditing. The brand personality is authoritative, precise, and transparent, moving away from "magical" AI tropes toward a "scientific tool" aesthetic. It targets CTOs, SEO directors, and data analysts who require clarity over decoration.

The visual style is **Corporate Modern** with a focus on data density and high-legibility dashboards. It prioritizes functional white space, sharp information architecture, and a structured hierarchy that evokes a sense of reliability and institutional trust. The interface uses a clean "Dashboard" aesthetic where information is modularized into distinct analytical containers.

## Colors

This color palette is designed to emphasize "Audit" and "Action." 

- **Primary Blue (#1536B8)** and **Primary Dark (#102A8F)** are used for structural elements, navigation, and signifying "Analysis" or "Processing" states.
- **Accent Coral (#FF5A4F)** is reserved strictly for primary calls to action and critical "Out of Compliance" data points, ensuring these elements break the cool-toned professional field.
- **Background (#F6F8FB)** and **Surface (#FFFFFF)** create a subtle tonal separation between the application canvas and the interactive data cards.
- **Text Primary (#111827)** provides high-contrast readability for data strings, while **Text Secondary (#6B7280)** handles metadata and labels.

## Typography

The design system utilizes **Inter** for its neutral, systematic character and exceptional legibility in data-heavy environments. 

- **Headlines:** Use tighter letter-spacing and semi-bold weights to create a strong visual anchor for report sections.
- **Body:** Standardized at 16px for optimal reading of long-form audit explanations.
- **Labels:** Utilized for table headers and metadata; these should be uppercase with slight tracking to differentiate them from interactive text.
- **Data-Mono:** While using Inter, numeric data in tables should utilize tabular lining (tnum) features to ensure columns of figures align perfectly for easy comparison.

## Layout & Spacing

The layout follows a **Fixed-Fluid Hybrid** model. The sidebar navigation remains fixed, while the main content area utilizes a 12-column fluid grid that caps at 1440px to prevent excessive line lengths in data tables.

- **Desktop:** 12 columns, 24px gutters, 40px external margins.
- **Tablet:** 8 columns, 16px gutters, 24px external margins.
- **Mobile:** 4 columns, 16px gutters, 16px external margins.

The spacing rhythm is built on an **8px base unit**. Component internals (like card padding) should default to 24px (`stack-lg`) to maintain a premium, spacious feel even when displaying dense information.

## Elevation & Depth

Visual hierarchy is established through a combination of **Tonal Layering** and **Ambient Shadows**.

- **Level 0 (Background):** The `#F6F8FB` canvas.
- **Level 1 (Cards/Surfaces):** White surfaces (`#FFFFFF`) with a very soft, diffused shadow: `0px 4px 20px rgba(0, 0, 0, 0.05)`. These cards should have a subtle 1px border in `#E5E7EB` to ensure definition on high-brightness displays.
- **Level 2 (Dropdowns/Modals):** Elevated surfaces with a more pronounced shadow: `0px 12px 32px rgba(16, 42, 143, 0.10)`. Note the slight blue tint in the shadow to maintain brand harmony.

Avoid heavy blurs or glassmorphism to maintain the professional, data-first integrity of the audit tool.

## Shapes

The shape language balances approachability with professional structure. 

- **Cards & Primary Containers:** Use `rounded-xl` (1.5rem / 24px) to create a modern, high-end dashboard feel.
- **Buttons & Inputs:** Use `rounded-lg` (1rem / 16px) to match the card aesthetic while remaining distinct as interactive elements.
- **Data Badges/Status Pills:** Use full rounding (capsule shape) to differentiate them from buttons.

## Components

### Buttons
- **Primary:** Background `#FF5A4F` (Accent Coral), Text `#FFFFFF`. Solid fill, no gradient. On hover, darken to a deep coral.
- **Secondary:** Background `#FFFFFF`, Border 1px `#1536B8`, Text `#1536B8`. 
- **Ghost:** Text `#1536B8`, no background. Used for secondary navigation within cards.

### Cards
All cards must use the `#FFFFFF` surface, 24px internal padding, and 24px border-radius. Headers within cards should be separated by a 1px border line (`#E5E7EB`).

### Structured Data Tables
- **Header:** Background `#F6F8FB`, Text `label-md` (`#6B7280`).
- **Rows:** 1px bottom border only. No zebra striping; use hover states (light blue tint) to highlight active rows.
- **Alignment:** Text left-aligned, numeric data right-aligned.

### Progress Rings
For "Audit Scores," use circular SVG rings. 
- **Track:** `#E5E7EB`.
- **Indicator:** `#1536B8` (Primary Blue) for healthy scores; `#FF5A4F` (Coral) for critical alerts.
- **Center:** Place the numerical score in `headline-md` weight.

### Input Fields
Background `#FFFFFF`, Border 1px `#E5E7EB`, 16px roundedness. On focus, the border shifts to `#1536B8` with a 3px soft blue glow.

## Report UI (Overview + Detail Pages)

Source of truth: `/report` Overview. Shared tokens live in `src/components/report/reportStyles.ts`.

### Layout
- **Shell:** `CategoryDetailLayout` / `ReportLayout` — sidebar + top nav + `mainShell` (`max-w-container-max`, `p-margin-mobile md:p-margin-desktop`)
- **Page stack:** `space-y-stack-lg` between major sections
- **Grid gap:** `gap-gutter` (24px)
- **Breadcrumb:** `mb-gutter` below breadcrumb only

### Typography
| Role | Token / class |
|------|----------------|
| Page title | `text-headline-lg font-semibold` (`pageTitle`) |
| Section title | `text-headline-md` (`sectionTitle`) |
| Card title | `text-headline-lg text-primary` (`cardTitle`) |
| Body | `text-body-md` |
| Labels / table headers | `text-label-md uppercase` (`subsectionLabel`, `tableHeadCell`) |
| Score numbers | `text-headline-md tabular-nums` |
| Badges | `text-label-md` status pills; `text-[10px] font-bold uppercase` table badges |

### Cards
- **Standard:** `rounded-[24px] border border-outline-variant bg-white card-shadow`
- **Padding:** `p-stack-lg` (default), `p-stack-xl` (hero/summary)
- **Hero:** score ring + title + status badge + summary (`CategoryHeroCard`, `CategoryDetailHeader`)

### Tables
- **Section header bar:** `bg-surface-container-low px-stack-lg py-stack-md border-b`
- **Head cells:** `px-stack-lg py-4 text-label-md uppercase text-on-surface-variant`
- **Body cells:** `px-stack-lg py-5`
- **Row hover:** `hover:bg-primary-container/5`

### Shared category components
- `CategoryKpiStrip` / `CategorySimpleKpiStrip` — KPI cards
- `CategoryFindingsTable` — grouped SEO findings
- `CategorySignalFindingsTable` — signal/status/detail rows
- `CategoryIssuesSection` / `CategoryGapsListSection` — issue cards or lists
- `CategoryRecommendationsSection` / `CategoryTopRecommendationCard`
- `CategoryBenchmarkCard`, `CategoryImplementationExamples`

Do not use `rounded-3xl`, `shadow-sm`, or `text-[18px]` on report cards — use tokens above.