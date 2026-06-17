# Next Task

**Goal:** Extend sitewide signal aggregation to Answer Extraction audit.

**Verify:**
- `/report` Visual Insights shows Social Metadata beside Schema Coverage
- OG/Twitter scores and present/total match `/report/open-graph` and `/report/twitter-card`
- Missing social tags → lower scores and fewer pass findings
- Mobile stacks all four cards in single column

## Done

- `generateVisualInsights()` adds `socialMetadataCoverage` from OG + Twitter audits
- `SocialMetadataCoverageCard` with progress bars and footer note
