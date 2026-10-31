"""Bounded primary-source checks; no credentials, archives, or dependencies."""
import concurrent.futures
import json
import re
import urllib.request

URLS = [
    'https://api.github.com/repos/wizz13150/prime-gap-network',
    'https://raw.githubusercontent.com/wizz13150/prime-gap-network/main/README.md',
    'https://raw.githubusercontent.com/wizz13150/prime-gap-scout/main/README.md',
    'https://gapcoin-project.github.io/maths/2021/04/10/exploring-the-mysteries-of-the-prime-gap-line/',
    'https://gapcoin-project.github.io/maths/2017/07/19/large-gaps-between-primes/',
    'https://bitcointalk.org/index.php?topic=822498.0',
    'https://primegap-list-project.github.io/',
]

def check(url):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'PGN-community-website-source-check'})
        with urllib.request.urlopen(req, timeout=25) as response:
            data = response.read(120_000).decode('utf-8', 'replace')
            print('\nURL', url, 'HTTP', response.status)
        if 'api.github' in url:
            obj = json.loads(data)
            print(json.dumps({k: obj.get(k) for k in ['description', 'created_at', 'default_branch', 'has_pages', 'homepage']}, ensure_ascii=False))
        elif url.endswith('README.md'):
            print(data[:15500])
        else:
            print('TITLE', re.findall(r'<title[^>]*>(.*?)</title>', data, re.S)[:1])
            print('VIDEO', re.findall(r'(?:youtube(?:-nocookie)?\.com/(?:embed/|watch\?v=)|youtu.be/)([\w-]+)', data))
            print('PRIMARY LINKS', re.findall(r'href=[\"\']([^\"\']+)', data)[:12])
    except Exception as error:
        print('FAILED', url, str(error))

with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
    list(executor.map(check, URLS))
