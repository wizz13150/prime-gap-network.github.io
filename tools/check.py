"""Dependency-free site integrity and bounded external-source checks."""
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json
import re
import sys
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://wizz13150.github.io/prime-gap-network.github.io/'


class Page(HTMLParser):
    def __init__(self, filename):
        super().__init__(convert_charrefs=True)
        self.filename = filename
        self.ids, self.links, self.labels, self.controls = set(), [], [], []
        self.h1, self.main, self.lang, self.description, self.viewport = 0, 0, None, False, False
        self.errors = []
        self.feed(filename.read_text(encoding='utf-8'))

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a:
            if a['id'] in self.ids:
                self.errors.append('Duplicate ID: ' + a['id'])
            self.ids.add(a['id'])
        if tag == 'html': self.lang = a.get('lang')
        if tag == 'h1': self.h1 += 1
        if tag == 'main': self.main += 1
        if tag == 'meta' and a.get('name') == 'description': self.description = bool(a.get('content'))
        if tag == 'meta' and a.get('name') == 'viewport': self.viewport = True
        if tag == 'label' and 'for' in a: self.labels.append(a['for'])
        if tag in ('input', 'select', 'textarea'):
            self.controls.append(a)
        if tag == 'script' and (a.get('src', '').startswith('http') or 'src' not in a):
            self.errors.append('Unexpected third-party or inline script')
        for attr in ('href', 'src'):
            if attr in a: self.links.append(a[attr])


pages = {p.name: Page(p) for p in sorted(ROOT.glob('*.html'))}
errors, link_count = [], 0
for name, page in pages.items():
    errors += [name + ': ' + e for e in page.errors]
    for condition, message in [(page.lang == 'en', 'English lang attribute'),
                               (page.h1 == 1, 'one H1'), (page.main == 1, 'one main landmark'),
                               (page.description, 'meta description'), (page.viewport, 'viewport')]:
        if not condition: errors.append(name + ': missing ' + message)
    for control in page.controls:
        if control.get('id') not in page.labels and not control.get('aria-label'):
            errors.append(name + ': unlabelled form control')
    for url in page.links:
        u = urlsplit(url)
        if u.scheme in ('https', 'http'):
            if not url.startswith(BASE): continue
            relative = url[len(BASE):].split('#')[0]
        elif u.scheme: continue
        else: relative = unquote(u.path)
        target = (ROOT / relative).resolve() if relative else page.filename
        if target.is_dir(): target /= 'index.html'
        if ROOT not in target.parents:
            errors.append(name + ': link leaves site root ' + url)
            continue
        link_count += 1
        if not target.exists():
            errors.append(name + ': missing link target ' + url)
        elif u.fragment and target.suffix == '.html':
            target_page = pages.get(target.name)
            if target_page and unquote(u.fragment) not in target_page.ids:
                errors.append(name + ': missing fragment ' + url)

inventory = json.loads((ROOT / 'sources.json').read_text(encoding='utf-8'))
resources = (ROOT / 'resources.html').read_text(encoding='utf-8')
for source in inventory['sources']:
    if 'source-' + source['id'] not in resources:
        errors.append('Source missing from library: ' + source['id'])
for required in ['.nojekyll', 'sitemap.xml', 'robots.txt', 'CONTRIBUTING.md', 'docs/QA.md']:
    if not (ROOT / required).exists(): errors.append('Missing ' + required)
for old in ['Samuel Troisi', 'A longer mathematical lecture', 'v1.3.5']:
    if any(old in p.read_text(encoding='utf-8') for p in ROOT.glob('*.html')):
        errors.append('Unverified/stale wording: ' + old)
print(json.dumps({'pages': len(pages), 'local_links': link_count,
                  'sources': len(inventory['sources']), 'errors': errors}, indent=2))
if errors: raise SystemExit(1)


def external(source):
    url = source['url']
    result = {'id': source['id'], 'url': url}
    if 'youtube.com/watch' in url:
        url = 'https://www.youtube.com/oembed?url=' + urllib.parse.quote(url, safe='') + '&format=json'
        result['verification_url'] = url
    request = urllib.request.Request(url, headers={'User-Agent': 'PGN-community-site-source-check/1.0'})
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            text = response.read(65536).decode('utf-8', 'replace')
            result.update(http=response.status, final_url=response.url)
            if 'oembed' in url:
                data = json.loads(text)
                result.update(title=data.get('title'), author=data.get('author_name'))
            else:
                title = re.search(r'<title[^>]*>(.*?)</title>', text, re.I | re.S)
                result['title'] = re.sub(r'\s+', ' ', title[1]).strip()[:180] if title else None
    except urllib.error.HTTPError as e:
        result.update(http=e.code, limitation='Remote service refused the automated request; not proof of a broken public page.')
    except Exception as e:
        result.update(http=None, limitation=type(e).__name__)
    return result


if '--external' in sys.argv:
    with ThreadPoolExecutor(max_workers=5) as pool:
        results = list(pool.map(external, inventory['sources']))
    report = {'checked_at': datetime.now(timezone.utc).isoformat(),
              'scope': 'Bounded HTTP availability and video metadata, supplemented by manual primary-source review. HTTP success alone does not certify claims.',
              'results': results}
    (ROOT / 'docs/source-checks.json').write_text(json.dumps(report, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    for r in results: print(r['id'], r.get('http'), r.get('title') or r.get('limitation', ''))
