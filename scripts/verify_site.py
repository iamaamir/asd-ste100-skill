from __future__ import annotations

import json
import re
import struct
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / 'docs'
EXPECTED = 'https://iamaamir.github.io/asd-ste100-skill/'


class SiteParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags = []
        self.links = []
        self.ids = set()
        self.duplicate_ids = set()
        self.aria_refs = []
        self.titles = []
        self.in_title = False
        self.meta = []
        self.scripts = []
        self.h1 = 0

    def handle_starttag(self, tag, attrs):
        props = dict(attrs)
        self.tags.append(tag)
        if tag == 'h1': self.h1 += 1
        if tag == 'title': self.in_title = True
        if props.get('id'):
            if props['id'] in self.ids: self.duplicate_ids.add(props['id'])
            self.ids.add(props['id'])
        for attribute in ('aria-labelledby', 'aria-describedby'):
            if props.get(attribute): self.aria_refs.extend(props[attribute].split())
        if tag in {'a', 'link', 'script', 'img'}: self.links.append((tag, props.get({'a':'href','link':'href','script':'src','img':'src'}[tag])))
        if tag == 'meta': self.meta.append(props)
        if tag == 'script': self.scripts.append(props)

    def handle_endtag(self, tag):
        if tag == 'title': self.in_title = False

    def handle_data(self, data):
        if self.in_title: self.titles.append(data)


def verify():
    html_path = SITE / 'index.html'
    html = html_path.read_text(encoding='utf-8')
    page = SiteParser(); page.feed(html)
    assert html.lstrip().startswith('<!doctype html>'), 'HTML5 doctype missing'
    assert len(page.titles) == 1 and 'ASD-STE100' in page.titles[0] and 'Simplified Technical English' in page.titles[0], 'Missing descriptive SEO title'
    assert page.h1 == 1, 'Need one semantic H1'
    assert 'https://agentskills.io/' not in html, 'No promotional Agent Skills link should appear on the site'
    assert 'https://agentskills.io/' not in (ROOT / 'README.md').read_text(encoding='utf-8'), 'No promotional Agent Skills link should appear in the README'
    assert not page.duplicate_ids, f'Duplicate HTML ids: {page.duplicate_ids}'
    assert set(page.aria_refs).issubset(page.ids), f'Unresolved ARIA references: {set(page.aria_refs)-page.ids}'
    assert html.lstrip().startswith('<!doctype html>') and '<html lang="en">' in html, 'HTML language missing'
    assert 'main' in page.tags and 'nav' in page.tags and 'footer' in page.tags, 'Semantic layout missing'
    assert any(m.get('name') == 'description' and len(m.get('content', '')) > 90 for m in page.meta), 'Meta description missing'
    assert f'href="{EXPECTED}"' in html, 'Canonical URL mismatch'
    # Social previews must work for non-JavaScript crawlers and must reference a real raster asset.
    def unique_meta(key, value):
        matches = [tag.get('content') for tag in page.meta if tag.get(key) == value]
        assert len(matches) == 1 and matches[0], f'Expected one nonempty {value} metadata tag'
        return matches[0]

    og_title = unique_meta('property', 'og:title')
    og_description = unique_meta('property', 'og:description')
    og_url = unique_meta('property', 'og:url')
    og_image = unique_meta('property', 'og:image')
    assert 'ASD-STE100' in og_title and 'Simplified Technical English' in og_title
    assert len(og_description) >= 90 and og_url == EXPECTED
    assert unique_meta('property', 'og:type') == 'website'
    assert unique_meta('property', 'og:locale') == 'en_US'
    assert unique_meta('property', 'og:image:secure_url') == og_image
    assert unique_meta('property', 'og:image:type') == 'image/png'
    assert unique_meta('property', 'og:image:width') == '1200'
    assert unique_meta('property', 'og:image:height') == '630'
    assert len(unique_meta('property', 'og:image:alt')) > 20
    assert unique_meta('name', 'twitter:card') == 'summary_large_image'
    assert unique_meta('name', 'twitter:image') == og_image
    assert len(unique_meta('name', 'twitter:image:alt')) > 20
    assert unique_meta('name', 'twitter:title') and unique_meta('name', 'twitter:description')
    assert og_image.startswith(EXPECTED + 'assets/'), 'OG image must use the canonical absolute URL'
    image_path = SITE / og_image.removeprefix(EXPECTED)
    assert image_path.is_file(), f'OG image does not exist: {image_path}'
    with image_path.open('rb') as f:
        header = f.read(24)
    assert header[:8] == b'\x89PNG\r\n\x1a\n', 'OG image is not a PNG'
    assert struct.unpack('>II', header[16:24]) == (1200, 630), 'OG image dimensions mismatch'
    assert image_path.stat().st_size < 1_000_000, 'OG image must stay under 1 MB for GitHub social preview upload'
    assert 'application/ld+json' in html, 'JSON-LD missing'
    obj = re.search(r'<script type="application/ld\+json">(.*?)</script>', html, re.S)
    assert obj, 'JSON-LD block missing'; data = json.loads(obj.group(1)); assert data['@type'] == 'SoftwareSourceCode'
    for typ, url in page.links:
        if not url: continue
        if url.startswith('#'):
            assert url[1:] in page.ids, f'Broken anchor: {url}'
        elif url.startswith('./'):
            assert (SITE / url[2:]).is_file(), f'Missing asset: {url}'
        elif not url.startswith(('https://','mailto:')):
            raise AssertionError(f'Unexpected relative href: {url}')
    assert (SITE / '.nojekyll').is_file()
    assert 'Sitemap: ' + EXPECTED + 'sitemap.xml' in (SITE / 'robots.txt').read_text()
    assert '<loc>' + EXPECTED + '</loc>' in (SITE / 'sitemap.xml').read_text()
    assert 'aria-label="Copy installation command"' in html
    assert html.count('<section ') == 4, 'Keep the landing page concise'
    assert html.count('data-example=') == 6, 'Six scenario chips expected'
    assert 'id="demo-highlight"' in html and 'id="issue-tooltip"' in html, 'Inline diagnostics missing'
    assert 'CI ENVIRONMENTS' not in html, 'Do not market Python CI environments'
    assert 'class="review-cycle"' in html and 'id="cycle-a"' in html, 'Connected review-cycle diagram missing'
    assert 'class="review-cycle" role="group"' in html, 'Diagram headings must remain accessible'
    assert 'class="wrap install-trust-note"' in html and 'Independent, not certified.' in html, 'Limitations must be inside the installation panel'
    assert 'A review loop.' not in html and 'Editor-like feedback.' not in html and 'inline findings' not in html and 'Not a one-way pipe.' not in html, 'Design discussion language leaked into landing-page copy'
    assert 'role="tooltip"' in html, 'Accessible diagnostic tooltip missing'
    assert html.count('stack-chapter') == 4, 'All four main chapters must be stacked'

    interaction = (SITE / 'assets/app.js').read_text()
    styles = (SITE / 'assets/styles.css').read_text()
    assert "pointerover" in interaction and "data-diagnostic" in interaction, 'Hoverable issue marks missing'
    assert re.search(r"mark\[data-diagnostic\]\s*\{\s*pointer-events:\s*auto", styles), 'Marks must receive hover events'
    assert any(a.get('src','').endswith('preview-core.js') for a in page.scripts), 'Preview core script missing'
    assert 'position:sticky' in styles and '--stack-top' in styles, 'Sticky stacking and dynamic top offset missing'
    assert 'measureChapters' in interaction and 'updateStackDepth' in interaction, 'Stack depth and tall-content logic missing'
    assert 'ste-install-float' in styles and 'prefers-reduced-motion:reduce' in styles, 'Floating art and reduced-motion fallback missing'
    assert 'not the full python checker' in html.lower(), 'Demo limitations must be visible'
    assert 'npx skills add iamaamir/asd-ste100-skill --skill ste-technical-writing' in html

    llms = (SITE / 'llms.txt').read_text(encoding='utf-8')
    assert llms.startswith('# ASD-STE100') and '\n> ' in llms, 'llms.txt must follow the project-summary convention'
    assert 'rel="describedby" type="text/markdown" href="./llms.txt"' in html, 'llms.txt discovery link missing'
    assert 'https://github.com/iamaamir/asd-ste100-skill' in llms, 'LLM context must link to the real repository'
    assert 'not an official publication' in llms.lower() and 'not included' in llms.lower(), 'LLM context must state compliance limitations'
    assert len(re.findall(r'^- \[.+?\]\(https://.+?\)', llms, re.M)) >= 6, 'llms.txt resource links missing'
    assert 'forced-colors:active' in styles, 'High-contrast text-editor fallback missing'
    assert 'stack-chapter:focus-within' in styles, 'Focused chapter must remain navigable'

    # Regression guards for small-text AA contrast on the section's solid colors.
    def luminance(color):
        channels = [int(color[i:i+2],16)/255 for i in (1,3,5)]
        linear = [x/12.92 if x <= .04045 else ((x+.055)/1.055)**2.4 for x in channels]
        return sum(a*b for a,b in zip(linear,(.2126,.7152,.0722)))
    def contrast(fg,bg):
        high,low=sorted((luminance(fg),luminance(bg)),reverse=True)
        return (high+.05)/(low+.05)
    pairs = [('#426d70','#f2f6f4'),('#466a6f','#f2f6f4'),('#c4e0e1','#0a2934'),('#315f63','#eaf5f1'),('#a9bcb2','#091015')]
    assert all(contrast(fg,bg)>=4.5 for fg,bg in pairs), 'Small-text color contrast must be >= 4.5:1'
    print(f'PASS: SEO, OG/Twitter cards, 1200x630 PNG, local assets, semantic structure, JSON-LD, anchors and installation command ({len(page.links)} links checked)')


if __name__ == '__main__':
    try: verify()
    except (AssertionError, ValueError, KeyError) as exc:
        print(f'FAIL: {exc}', file=sys.stderr); sys.exit(1)
