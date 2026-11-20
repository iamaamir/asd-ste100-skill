from __future__ import annotations

import json
import re
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
        if props.get('id'): self.ids.add(props['id'])
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
    assert 'main' in page.tags and 'nav' in page.tags and 'footer' in page.tags, 'Semantic layout missing'
    assert any(m.get('name') == 'description' and len(m.get('content', '')) > 90 for m in page.meta), 'Meta description missing'
    assert f'href="{EXPECTED}"' in html, 'Canonical URL mismatch'
    assert any(m.get('property') == 'og:image' for m in page.meta), 'Open Graph image missing'
    assert any(m.get('name') == 'twitter:card' for m in page.meta), 'Twitter card missing'
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
    assert (SITE / 'assets/social-preview.png').stat().st_size > 2000
    assert 'aria-label="Copy installation command"' in html
    assert html.count('<section ') == 4, 'Keep the landing page concise'
    assert html.count('data-example=') == 6, 'Six scenario chips expected'
    assert 'id="demo-highlight"' in html and 'id="issue-tooltip"' in html, 'Inline diagnostics missing'
    assert 'CI ENVIRONMENTS' not in html, 'Do not market Python CI environments'
    assert 'class="review-cycle"' in html and 'id="cycle-a"' in html, 'Connected review-cycle diagram missing'
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
    print(f'PASS: SEO, metadata, local assets, semantic structure, JSON-LD, anchors and installation command ({len(page.links)} links checked)')


if __name__ == '__main__':
    try: verify()
    except (AssertionError, ValueError, KeyError) as exc:
        print(f'FAIL: {exc}', file=sys.stderr); sys.exit(1)
