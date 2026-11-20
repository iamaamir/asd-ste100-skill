# Landing page UX, accessibility, and discovery audit

Last reviewed: 2026-11-20.

## Fixed

- **Install content clipped at viewport edges.** The sticky chapter uses flexbox. A former `flex: 1` on its `.wrap` overrode the site's centered max-width at desktop sizes. The wrap now has explicit responsive width limits, tested from 320–1440 CSS pixels.
- **Compliance notice appeared outside the last pinned panel.** Moved the disclaimer into the install section with its own separation, making the page boundary and reading order clearer.
- **Low-contrast small text.** Strengthened small secondary text in the evidence bar, footer, illustration, and install notes. Selected normal-text contrast ratios are checked against the WCAG AA 4.5:1 threshold in the site verifier.
- **Review-cycle headings could be collapsed into a single image.** Used an accessible group instead of an image role for the text-based process diagram.
- **Stacked chapters and keyboard focus.** Focused chapters rise above overlapping panels while interacted with. Visible focus outlines and 44px minimum interactive targets are used for the main buttons.
- **Editor legibility in forced-colors mode.** The plain textarea text becomes visible and the purely decorative highlight layer is hidden.
- **AI-readable documentation missing.** Added `/llms.txt` as a concise directory of authorized project resources, with explicit disclaimers. Linked it from the document head and footer.
- **Long page description.** Shortened the home page's description to communicate the product value and scope directly.

## Verified locally

- A single meaningful H1, descriptive HTML title and meta description, canonical URL, social metadata, software source JSON-LD, and crawlable HTML content.
- Correct fragment links, local static assets, robots/sitemap references, and `llms.txt` format and resource links.
- Valid references for static ARIA IDs; no duplicate IDs; labelled document types, sample buttons, copy command, and editor; a first-in-order skip link.
- Six Chromium viewport sizes, normal and reverse navigation by anchor links, hover and keyboard-accessible editor diagnostics, no horizontal overflow or JavaScript errors.
- Reduced-motion fallback, forced-colors text fallback, and structural regression tests.

## Limits and follow-up

- Selected CSS contrast pairs are tested mathematically. A site-wide color analysis with automated tools (such as axe) and manual checks in VoiceOver/NVDA are still recommended.
- Zoom behavior, speech input, and real-device touch/assistive-technology combinations were not exhaustively tested.
- `llms.txt` is a community proposal, not an official search index signal. It does not replace `robots.txt`, the HTML page, or the sitemap; crawlers can ignore it.
- This site describes an independent skill. It does not certify conformity to ASD-STE100, and its three-check demonstration is not the full checker or the official dictionary.
