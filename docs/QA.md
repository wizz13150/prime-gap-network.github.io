# First-draft verification

This is a static informational website. It has no mining, wallet, ticket-issuing, reservation, or live network backend.

## Repeatable checks

Run from the repository root, using Python 3.9+ and Node.js:

```text
python tools/build.py
python tools/check.py
node --check assets/site.js
node tools/check-interactions.cjs
python tools/check.py --external
```

The integrity checker covers all eight HTML documents, local paths and fragments, duplicate IDs, primary landmarks, language, metadata, labelled controls, script provenance, and source-library coverage. The interaction check uses a small DOM harness: it checks the four teaching examples against independent trial division, combined library filters, empty results and recovery, and menu Escape/focus behavior. It is not a substitute for browser rendering.

External checks are bounded to 64 KB per source and recorded in `source-checks.json`. YouTube links are verified through official oEmbed title/channel metadata. A remote refusal is reported separately from a successful page response. Content is also reviewed against original project documentation, author/publisher pages, and maintained mathematical references.

## Editorial verification

- PGN credit and development status: public PGN README and repository metadata.
- Scout separation, numeric domain, current release route, checkpoints and proof/coverage limits: its public README and validation record. No unpublished release tag is announced.
- Gap definitions, merit and first-occurrence distinctions: Nicely’s preserved original rubric, OEIS and PrimePages, accounting for the different composite-count convention.
- Paper authorship: publisher metadata and author preprint (Seth Troisi).
- Network details: operator-supplied Rob Smith working design, explicitly labelled as proposals. No public final protocol specification is asserted.
- Historical Gapcoin discussions: attributed to that separate project, with old performance/economic assertions kept out of PGN claims.

## Browser review

Browser observations and the deployment receipt are recorded in `release-check.json` after inspection. Scope includes desktop/mobile layout, the gap selector, library filtering, the mobile menu, FAQ expansion, console errors, and the real GitHub Pages URL. Screen-reader behavior is reviewed through semantic markup and accessibility state; a full assistive-technology audit has not been performed.

## Remaining limits

This first draft needs Robert and community editorial feedback. Proposed network rules require specification and executable protocol verification in their own project. Source checks establish observed availability and attribution, not a mathematical correctness certificate for linked software or papers. No GPU, miner-scale, consensus, reward, or production-network testing is part of this website release.
