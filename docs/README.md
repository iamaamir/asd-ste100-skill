# Project landing page

The landing page is a **static, zero-build, zero-framework site** in [`docs/`](./index.html), intended for GitHub Pages at:

https://iamaamir.github.io/asd-ste100-skill/

## Site map

- `index.html`: server-rendered semantic copy, accessible sections, SEO metadata, JSON-LD, FAQ, and interactive demo markup.
- `assets/styles.css`: responsive editorial design and CSS motion with reduced-motion support.
- `assets/app.js`: an intentionally limited in-browser structural-check demonstration. It does not fetch any network resources or represent the Python checker.
- `assets/hero-grid.svg` and `assets/favicon.svg`: resolution-independent decorative/brand assets.
- `assets/social-preview.png`: 1200×630 social preview (generated specifically for the project).
- `robots.txt` and `sitemap.xml`: crawler discovery and index instructions.

## Run locally

From the repository root:

```sh
python3 -m http.server 8000 --directory docs
```

Visit http://localhost:8000. No `npm install`, bundler, or third-party runtime packages are required.

## Verification

```sh
python3 scripts/verify_site.py
python3 skills/ste-technical-writing/scripts/verify_skill.py
```

The first checks HTML semantics, internal links, mandatory SEO metadata, schema, copy boundaries, and expected assets. The second checks the installed skill and its regression suite. GitHub Actions runs both.

## Deployment

The `.github/workflows/deploy-pages.yml` workflow publishes `docs/` after changes to the site on `main`. **GitHub Pages may require initial activation** in **Settings → Pages → Build and deployment → GitHub Actions** if the API or workflow cannot activate it automatically.

The canonical URL and sitemap assume the project path `/asd-ste100-skill/`. If the repository or hosting domain changes, update the following together:

1. `<link rel="canonical">` in `index.html`
2. Open Graph and Twitter image URLs and the structured data URL in `index.html`
3. `robots.txt` and `sitemap.xml`
4. All install commands and GitHub links, if the repository name changes

Search indexing is not automatic or guaranteed. Once the site is live, consider adding it to Google Search Console, submitting the sitemap, and reviewing performance and accessibility with Lighthouse.

## Evidence and compliance

The page deliberately distinguishes **53 mapped writing rules** and **21 baseline checker regression tests** from linguistic or safety accuracy. These numbers describe the verification baseline as of **2026-11-20** and should be updated if the package changes. Do not display unsupported effectiveness percentages, claim certified STE compliance, imply that all 53 rules are implemented as executable checks, or reproduce the copyrighted official dictionary.

The project is not officially affiliated with or endorsed by ASD/STEMG. Preserve the independent-project and human-review disclaimers.

## Landing page information architecture

The main page intentionally has just four sections: hero, three-stage review process, writing playground, and install. Two concise evidence figures appear below the workflow; human review limitations appear in the demo disclosure and a small note after install. Python CI version coverage belongs in Actions, not as a visitor-facing metric.

The playground is educational. It is **not** a port of the Python checker: its only checks are approximate sentence length, literal semicolons, and common contractions. It runs entirely in the browser and must never be presented as a compliance validator. Its mirrored textarea marks affected ranges; hovering a marked region or placing the caret within it opens a contextual explanation without leaving the editor. The pure rules and six example fixtures live in `docs/assets/preview-core.js` and are tested without dependencies via `node --test scripts/preview.test.cjs`.

Run site and demo checks with:

```bash
python3 scripts/verify_site.py
node --test scripts/preview.test.cjs
```

## Scroll treatment and visual system

The four full-bleed chapters use **native CSS `position: sticky`** to create a stacked scroll experience: each new chapter slides over the chapter before it. The layout always uses `min-height: 100svh`, not a fixed height, so chapters with longer text can grow without truncation. JavaScript measures each chapter's overflow and applies a negative sticky offset when needed; readers scroll through all of a tall chapter before it pins. Scroll events update a restrained scale/vertical-offset treatment on the section behind the incoming one; no wheel interception, forced scroll snapping, or animation-dependent navigation occurs.

The installation illustration floats gently using CSS animation and stays still when the visitor requests reduced motion. The reduced-motion version also disables the stacked pinning and keeps all content in normal reading order. The teal installation panel matches the workflow illustration and remains full width at every breakpoint.

In addition to the normal checks, inspect this behavior in a browser at desktop, tablet, and phone widths. Verify both scroll directions, the hero's playground link, focus and hover in the interactive example, the footer, and reduced-motion settings. In a long chapter, the final lines must remain reachable before the next panel overlays them.
