# Next Task

**Goal:** Extend sitewide signal aggregation to Answer Extraction audit.

**Verify:**
- `/report` sections stagger in on load
- Detail pages replay animation on route change (`domain` + category key)
- `prefers-reduced-motion` disables transforms; print has no animation artifacts

## Done

- `ReportMotion.tsx` — `ReportFadeIn`, `ReportStagger`, `ReportStaggerItem`, `ReportDetailMotion`
- Overview + `CategoryDetailLayout` stagger; shared category components use motion context
