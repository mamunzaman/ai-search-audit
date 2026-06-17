# Next Task

**Goal:** Extend sitewide signal aggregation to Answer Extraction.

**Verify:**
- Run audit on a multi-page site; confirm answer-extraction findings reflect crawled pages beyond the homepage.

## Done

- UI debug flow: homepage checkbox → debug audit → report download button
- Server still writes `.audit-debug/*.json`; client downloads stored payload (no server path exposure)
