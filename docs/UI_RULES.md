# UI Rules

## Source of Truth

1. DESIGN_SYSTEM.md
2. UI_RULES.md
3. Page reference HTML
4. Page reference PNG

If there is a conflict:

DESIGN_SYSTEM.md wins for tokens.
HTML reference wins for implementation layout.
PNG reference is visual backup only.

---

## Page References

Homepage:
- homepage-reference.html
- homepage-reference.png

LLM Visibility Report:
- report-reference.html
- report-reference.png

---

## Design Consistency Rules

No UI changes may introduce:

- new colors
- new spacing scales
- new shadows
- new typography systems
- new border radius values
- new component patterns
- new layout patterns

without updating DESIGN_SYSTEM.md first.

---

## Component Rules

- Convert Stitch HTML into reusable React components.
- Do not paste one full HTML file into one page component.
- Reuse existing components whenever possible.
- Check for an existing component before creating a new one.
- Prefer composition over duplicate UI.
- Keep visual consistency across all pages.

---

## Workflow

Before any UI work:

1. Read DESIGN_SYSTEM.md
2. Read UI_RULES.md
3. Review the correct page reference HTML
4. Review the PNG only as visual backup
5. Reuse or create clean components
6. Implement changes
7. Keep the design system consistent

Never make design assumptions that are not defined in DESIGN_SYSTEM.md or the page reference HTML.