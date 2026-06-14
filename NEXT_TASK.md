# Next Task

**Goal:** Start `feature/advanced-audit-signals` branch — WCAG 2.2 detail page + deeper audit signal mapping.

**Verify:**
- WCAG 2.2 sidebar link routes to a real page
- Growth Potential / carousel cards link to matching category detail pages
- Indexability KPI links to SEO Health detail page

## End-of-day audit completed (14 June 2026)

**Passed checks**
- `npm run lint` — pass (1 pre-existing font warning in `layout.tsx`)
- `npm run build` — pass; all 10 app routes compile
- `npm run dev` — all routes return HTTP 200: `/`, `/report`, 6 category detail pages
- Sidebar routes preserve `?domain=` for Overview, SEO Health, AI Visibility, Entity Clarity, Trust Signals, Content Structure, Schema Markup
- Schema Health + AI Visibility KPIs on report overview link to detail pages
- Detail pages use hydration-safe sessionStorage pattern (fallback SSR → load after mount)
- Fixed hydration on `/report` and `/report/seo-health` (same pattern as detail pages)
- Responsive guards: `min-w-0`, `overflow-x-hidden` on report shells; tables/code scroll inside card wrappers
- No lorem ipsum; copy positions product as AI Search Audit / LLM visibility (not generic SEO checker)
- Material Symbols via shared `Icon` component; no missing exports in `src/components/report/index.ts`

**Known minor issues**
- WCAG 2.2 sidebar item still routes to `#` (page not built)
- Sidebar hidden below `md`; no mobile nav drawer
- Growth Potential / Visual Insights carousel cards not linked to category pages
- Indexability KPI on overview not linked to SEO Health
- Settings, Support, Export PDF, Apply Now, Re-Audit buttons are non-functional placeholders
- SEO Health uses `CategoryDetailLayout` (older shell) while other categories match HTML references
- Trust Signals score mismatch between homepage demo (88) and report demo (98)
- Reference PNG screenshots may be missing for some `docs/*-reference.png` files

**Next recommended branch:** `feature/advanced-audit-signals`
