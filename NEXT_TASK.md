# Next Task

**Goal:** Link Growth Potential / remaining carousel cards to category detail routes on `feature/advanced-audit-signals`.

**Verify:**
- Run audits on `https://example.com`, `https://www.wikipedia.org`, `https://openai.com` — confirm robots/sitemap signals in report categories
- Technical signals: robots reachable, sitemap discovered, AI crawler access warnings where expected

## Done

- robots.txt + sitemap.xml technical discovery — `analyzeTechnicalDiscovery()`, 7 normalized signals, gentle category scoring, audit schema v9
