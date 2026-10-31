# Contribute to the PGN community website

PGN was conceived by Rob Smith (`robert44444uk`). This repository is its community website, not the Horizon/core testbed or the standalone Scout tool.

For a correction, open an issue with the page, exact claim, and a primary source. For a bug, give the browser, viewport, steps, and observed behavior. Use the PGN Discord linked on the site for community discussion.

## Edit and preview

The published files are ordinary HTML, CSS, and JavaScript. Python's standard library generates repeated page structure; no packages or Node dependencies are required.

1. Edit content and shared templates in `tools/build.py`.
2. Edit styling in `assets/style.css` and interactions in `assets/site.js`.
3. Run `python tools/build.py` and `python tools/check.py`.
4. Check JavaScript with `node --check assets/site.js` and `node tools/check-interactions.cjs`.
5. Run `python -m http.server 8765 --bind 127.0.0.1` and open `http://127.0.0.1:8765/`.
6. Review desktop and mobile layouts, keyboard navigation, and no-JavaScript content before a pull request. Commit regenerated HTML with the source change.

## Content contract

- English first. Write useful original explanations; cite primary sources beside factual claims.
- Keep PGN's testbed status visible. Label design proposals as proposals.
- Scout is a separate standalone CUDA tool, not a PGN mode, wallet, or production miner. Link current releases rather than preannouncing tags.
- Preserve the distinction between a candidate, proved endpoints, a checked gap, a first known occurrence, and verified exhaustive coverage.
- Credit Rob Smith for PGN's concept and initiative. Attribute external records, papers, and videos to their authors.
- Never invent production activity, coin prices, rewards, partnerships, miner capacity, or a launch date.
- Keep the site lean. Prefer accessible native markup and original SVG. Do not add tracking, third-party video embeds, dependencies, or large media without a concrete reason.

## Publication

GitHub Pages serves the `main` branch root. This is a **project repository**, so its URL is `https://wizz13150.github.io/prime-gap-network.github.io/` unless hosting settings change. Relative links retain that prefix. The `.nojekyll` file selects static file serving.

`sources.json` is the public source inventory. `docs/source-checks.json` records bounded source checks; rerun `python tools/check.py --external` when updating external references. `docs/QA.md` states verification scope and limitations.

`tools/pages.py` is a maintainer helper for this repository's Pages configuration. It uses Git Credential Manager in memory and never prints credentials. It does not manage any other repository or release.
