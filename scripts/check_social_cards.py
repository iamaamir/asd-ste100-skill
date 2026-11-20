"""HTTP smoke test for the public Open Graph / Twitter card after GitHub Pages deploy.

Requires only Python's standard library. Fails if an unauthenticated crawler cannot
retrieve the server-side meta tags or the advertised PNG social image.
"""
from __future__ import annotations

import argparse
import struct
import sys
import time
from html.parser import HTMLParser
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import Request, urlopen

DEFAULT_URL = "https://iamaamir.github.io/asd-ste100-skill/"
USER_AGENT = "facebookexternalhit/1.1 (+https://www.facebook.com/externalhit_uatext.php)"


class MetaParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.meta: dict[str, list[str]] = {}

    def handle_starttag(self, tag, attrs):
        if tag != "meta":
            return
        props = dict(attrs)
        name = props.get("property") or props.get("name")
        if name:
            self.meta.setdefault(name, []).append(props.get("content", ""))

    def value(self, key):
        values = self.meta.get(key, [])
        if len(values) != 1 or not values[0]:
            raise ValueError(f"Expected exactly one {key} meta tag, got {values!r}")
        return values[0]


def fetch(url: str) -> tuple[str, bytes]:
    request = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(request, timeout=18) as response:
        content_type = response.headers.get_content_type()
        data = response.read(2_000_000)
    return content_type, data


def verify(url: str) -> None:
    if not url.startswith("https://"):
        raise ValueError("Verification URL must use HTTPS")
    content_type, document = fetch(url)
    if content_type != "text/html":
        raise ValueError(f"Unexpected HTML content type: {content_type}")
    page = MetaParser()
    page.feed(document.decode("utf-8"))
    image_url = page.value("og:image")
    if page.value("og:image:secure_url") != image_url or page.value("twitter:image") != image_url:
        raise ValueError("Open Graph and Twitter images disagree")
    if page.value("og:image:type") != "image/png":
        raise ValueError("Image content type metadata is not PNG")
    if page.value("og:image:width") != "1200" or page.value("og:image:height") != "630":
        raise ValueError("Image dimensions in metadata are incorrect")
    if not page.value("og:title") or not page.value("og:description"):
        raise ValueError("Open Graph title or description is absent")
    if page.value("twitter:card") != "summary_large_image":
        raise ValueError("Expected a large Twitter card")
    if urlsplit(image_url).netloc != urlsplit(url).netloc:
        raise ValueError("OG image should be on the same public website")
    image_type, image = fetch(image_url)
    if image_type != "image/png" or not image.startswith(b"\x89PNG\r\n\x1a\n"):
        raise ValueError("Image URL did not serve a PNG")
    if len(image) < 2_000 or len(image) >= 1_000_000:
        raise ValueError("Image size is outside the expected range")
    if struct.unpack(">II", image[16:24]) != (1200, 630):
        raise ValueError("Actual PNG dimensions differ from the metadata")
    print(f"PASS: crawler-visible Open Graph and Twitter metadata at {url}")
    print(f"PASS: public 1200x630 PNG at {image_url} ({len(image):,} bytes)")


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate public social cards after deployment")
    parser.add_argument("--url", default=DEFAULT_URL, help="HTTPS site URL to check")
    parser.add_argument("--attempts", type=int, default=10, help="Retry to allow the Pages CDN to update")
    parser.add_argument("--interval", type=float, default=5, help="Seconds between attempts")
    args = parser.parse_args()
    for attempt in range(1, args.attempts + 1):
        try:
            verify(args.url)
            return 0
        except (HTTPError, URLError, UnicodeError, ValueError, TimeoutError) as exc:
            print(f"Social preview smoke check {attempt}/{args.attempts}: {exc}", file=sys.stderr)
            if attempt < args.attempts:
                time.sleep(args.interval)
    return 1


if __name__ == "__main__":
    sys.exit(main())
