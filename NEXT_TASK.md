# Next Task

**Goal:** Extend sitewide signal aggregation to Answer Extraction.

**Verify:**
- Run audit on a multi-page site; confirm answer-extraction findings reflect crawled pages beyond the homepage.

## Done

- Intent-aware scoring: cloudflare.com 85, vercel.com 86, shopify.com 87 (category scores unchanged)
- `pageIntent` on audit response + debug output (`intent`, `confidence`, `reasons`)
